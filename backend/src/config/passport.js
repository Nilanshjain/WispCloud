import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js';
import { logger } from '../lib/logger.js';

// Google OAuth Strategy
export const configureGoogleStrategy = () => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        logger.warn('Google OAuth not configured, skipping strategy');
        return;
    }

    // Fail loud at boot rather than silently producing redirect_uri_mismatch
    // at runtime. Template-literal-interpolating `undefined` would yield the
    // string "undefined/api/auth/oauth/google/callback" — Google rejects, but
    // only when a real user clicks the button. Validate here so misconfigured
    // deploys can't get past startup.
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
        throw new Error(
            'GOOGLE_CLIENT_ID is set but BACKEND_URL is missing. ' +
            'OAuth callback URL cannot be built. Set BACKEND_URL to the public ' +
            'origin of this service (e.g. https://wispcloud-backend.onrender.com).'
        );
    }
    if (!/^https?:\/\//.test(backendUrl)) {
        throw new Error(
            `BACKEND_URL must start with http:// or https:// (got "${backendUrl}"). ` +
            'Google rejects callback URLs without a scheme.'
        );
    }

    // Logged at boot so operators can paste-compare against the Authorized
    // redirect URIs list in Google Cloud Console without having to mentally
    // concatenate the BACKEND_URL env var.
    const callbackURL = `${backendUrl}/api/auth/oauth/google/callback`;
    logger.info({ callbackURL }, 'Google OAuth strategy configured');

    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL,
                scope: ['profile', 'email'],
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Check if user already exists
                    let user = await User.findOne({
                        $or: [
                            { providerId: profile.id, authProvider: 'google' },
                            { email: profile.emails[0].value }
                        ]
                    });

                    if (user) {
                        // Update existing user
                        if (!user.providerId) {
                            user.providerId = profile.id;
                            user.authProvider = 'google';
                            await user.save();
                        }
                        return done(null, user);
                    }

                    // Generate unique username from Google profile
                    let username = profile.emails[0].value.split('@')[0].toLowerCase();
                    let existingUsername = await User.findOne({ username });
                    let counter = 1;

                    while (existingUsername) {
                        username = `${profile.emails[0].value.split('@')[0].toLowerCase()}${counter}`;
                        existingUsername = await User.findOne({ username });
                        counter++;
                    }

                    // Create new user
                    user = await User.create({
                        email: profile.emails[0].value,
                        username,
                        fullName: profile.displayName,
                        profilePic: profile.photos[0]?.value || '',
                        authProvider: 'google',
                        providerId: profile.id,
                    });

                    done(null, user);
                } catch (error) {
                    done(error, null);
                }
            }
        )
    );
};

// Serialize user
passport.serializeUser((user, done) => {
    done(null, user._id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id).select('-password');
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;
