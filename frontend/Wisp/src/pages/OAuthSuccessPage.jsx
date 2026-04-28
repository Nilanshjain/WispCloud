import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { axiosInstance } from '../lib/axios';
import { Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const OAuthSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuthUser, setAccessToken } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    // Strip the token from the URL the instant we land. The browser is already at
    // /auth/success?token=... and that URL is in history + Referer-on-outbound-requests.
    // history.replaceState rewrites the current entry without triggering navigation,
    // so the URL bar reads "/" before any external resource on this page can leak it.
    // Pairs with the backend's Referrer-Policy: no-referrer header on the callback.
    if (token || error) {
      window.history.replaceState({}, '', '/');
    }

    if (error) {
      toast.error('Authentication failed. Please try again.');
      navigate('/login');
      return;
    }

    if (token) {
      // Access token lands in memory (Zustand), NOT localStorage. Refresh cookie
      // was already set httpOnly by the backend's OAuth callback before this redirect.
      setAccessToken(token);

      axiosInstance.get('/auth/check')
        .then(res => {
          if (res.data._id) {
            setAuthUser(res.data);
            toast.success('Logged in successfully!');
            navigate('/');
          } else {
            throw new Error('Failed to fetch user data');
          }
        })
        .catch(err => {
          console.error('Error fetching user:', err);
          setAccessToken(null);
          toast.error('Authentication failed. Please try again.');
          navigate('/login');
        });
    } else {
      toast.error('Authentication failed. Please try again.');
      navigate('/login');
    }
  }, [searchParams, navigate, setAuthUser, setAccessToken]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader className="size-10 animate-spin mx-auto mb-4" />
        <p className="text-lg">Completing sign in...</p>
      </div>
    </div>
  );
};

export default OAuthSuccessPage;
