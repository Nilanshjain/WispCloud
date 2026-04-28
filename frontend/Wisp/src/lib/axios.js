import axios from "axios";

// Lazy import to break the cycle: useAuthStore imports axiosInstance, axiosInstance
// needs the store to read/write the access token. We import inside the interceptors
// so module-load order doesn't trip us.
const getAuthStore = () => import("../store/useAuthStore").then(m => m.useAuthStore);

export const axiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:5001"}/api`,
    // withCredentials:true so the browser attaches the httpOnly refresh cookie on
    // /auth/refresh calls. Required for cross-origin (Vercel↔Render) cookie attach,
    // and works in dev too. Has no effect on requests that don't have a same-origin
    // or sameSite-allowed cookie to send.
    withCredentials: true,
});

// Request interceptor — read the access token from in-memory Zustand state (NOT
// localStorage). XSS in a live tab can still read this, but the theft does not
// persist across reloads (memory is wiped on refresh). Refresh cookie is httpOnly
// so XSS cannot read it ever.
axiosInstance.interceptors.request.use(async (config) => {
    const useAuthStore = await getAuthStore();
    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor — transparent refresh on 401.
//
// Flow when the access token expires mid-session:
//   1. Original request returns 401.
//   2. We call POST /auth/refresh — browser auto-attaches the httpOnly refresh cookie.
//   3. Refresh returns a new access token; we store it in Zustand.
//   4. We retry the original request with the new token.
//   5. To the calling code, the 401 never happened — they get a successful response slightly later.
//
// Guards:
//   - _retry flag on the request config so we don't loop on a refresh that itself returns 401.
//   - Skip refresh on the /auth/refresh endpoint itself (it failing = real session death).
//   - Single-flight: if many requests 401 simultaneously, they all await the same in-flight
//     refresh promise. Otherwise we'd call /refresh N times for one expiry event.
let refreshInFlight = null;

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;

        // Not a 401, or already retried, or a refresh endpoint failure — bubble up.
        if (
            !error.response ||
            error.response.status !== 401 ||
            original?._retry ||
            original?.url?.includes("/auth/refresh") ||
            original?.url?.includes("/auth/login") ||
            original?.url?.includes("/auth/signup")
        ) {
            return Promise.reject(error);
        }

        original._retry = true;

        try {
            // Single-flight: if a refresh is already happening, wait for it instead of
            // firing another. This collapses N parallel 401s into one /refresh call.
            if (!refreshInFlight) {
                refreshInFlight = axiosInstance
                    .post("/auth/refresh")
                    .then((res) => res.data.accessToken)
                    .finally(() => {
                        refreshInFlight = null;
                    });
            }

            const newToken = await refreshInFlight;

            // Store the fresh token, then retry the original request with the new auth.
            const useAuthStore = await getAuthStore();
            useAuthStore.getState().setAccessToken(newToken);
            original.headers.Authorization = `Bearer ${newToken}`;
            return axiosInstance(original);
        } catch (refreshError) {
            // Refresh itself failed — session is dead. Wipe the in-memory token; UI
            // will re-render to logged-out state because authUser becomes null on
            // the next checkAuth.
            const useAuthStore = await getAuthStore();
            useAuthStore.getState().setAccessToken(null);
            useAuthStore.setState({ authUser: null });
            return Promise.reject(refreshError);
        }
    }
);
