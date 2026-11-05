
import { create } from 'zustand';
import { axiosInstance } from '../lib/axiosInstance.js';
import { toast } from 'sonner';

export const useAuthStore = create((set) => ({
    authUser: null,

    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingIn: false,
    isSendingOtp: false,
    isUpdatingEmail: false,
    isRenaming: false,
    isResettingPassword: false,
    isUploadingFile: false,

    // Check current logged-in user
    checkAuth: async () => {
        set({ isCheckingAuth: true });

        try {
            const response = await axiosInstance.get('/auth/me');

            set({
                authUser: response.data.user ?? null
            });

            return response.data;

        } catch (error) {
            console.error('Check auth error:', error);

            set({
                authUser: null
            });

            return null;

        } finally {
            set({ isCheckingAuth: false });
        }
    },

    // Login with email and password
    login: async (data) => {
        set({ isLoggingIn: true });

        try {
            const response = await axiosInstance.post(
                '/auth/login',
                data
            );

            set({
                authUser: response.data.user ?? null
            });

            toast.success(
                response.data.message || 'Login successful!'
            );

            return response.data;

        } catch (error) {
            console.error('Login error:', error);

            toast.error(
                error.response?.data?.message ||
                'Login failed. Please try again.'
            );

            return null;

        } finally {
            set({ isLoggingIn: false });
        }
    },

    // Register new user
    signup: async (data) => {
        set({ isSigningUp: true });

        try {
            const response = await axiosInstance.post(
                '/auth/signup',
                data
            );

            set({
                authUser: response.data.user ?? null
            });

            toast.success(
                response.data.message || 'Signup successful!'
            );

            return response.data;

        } catch (error) {
            console.error('Signup error:', error);

            toast.error(
                error.response?.data?.message ||
                'Signup failed. Please try again.'
            );

            return null;

        } finally {
            set({ isSigningUp: false });
        }
    },

    // Send OTP during signup
    sendSignupOtp: async (email) => {
        set({ isSendingOtp: true });

        try {
            const response = await axiosInstance.post(
                '/auth/send-signup-otp',
                { email }
            );

            toast.success(
                response.data.message ||
                'OTP sent successfully!'
            );

            return response.data;

        } catch (error) {
            console.error('Send OTP error:', error);

            toast.error(
                'Failed to send OTP. Please try again.'
            );

            return null;

        } finally {
            set({ isSendingOtp: false });
        }
    },

    // Logout current user
    logout: async () => {
        try {
            const response = await axiosInstance.post(
                '/auth/logout'
            );

            // Clear authentication state.
            // User-scoped stores should react to this change.
            set({
                authUser: null
            });

            toast.success(
                response.data.message || 'Logout successful!'
            );

            return response.data;

        } catch (error) {
            console.error('Logout error:', error);

            toast.error(
                error.response?.data?.message ||
                'Logout failed. Please try again.'
            );

            return null;
        }
    },

    // Update profile name
    updateName: async (newName) => {
        set({ isRenaming: true });

        try {
            const response = await axiosInstance.post(
                '/user/update-name',
                { name: newName }
            );

            set({
                authUser: response.data.user
            });

            toast.success(
                response.data.message || 'Name updated!'
            );

            return response.data;

        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                'Failed to update name'
            );

            return null;

        } finally {
            set({ isRenaming: false });
        }
    },

    // Update email address
    updateEmail: async ({ newEmail, otp }) => {
        set({ isUpdatingEmail: true });

        try {
            const response = await axiosInstance.post(
                '/user/update-email',
                { newEmail, otp }
            );

            set({
                authUser: response.data.user
            });

            toast.success(
                response.data.message || 'Email updated!'
            );

            return response.data;

        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                'Failed to update email'
            );

            return null;

        } finally {
            set({ isUpdatingEmail: false });
        }
    },

    // Send email update OTP
    sendEmailUpdateOtp: async (newEmail) => {
        set({ isSendingOtp: true });

        try {
            const response = await axiosInstance.post(
                '/user/send-email-update-otp',
                { newEmail }
            );

            toast.success(
                response.data.message ||
                'OTP sent successfully!'
            );

            return response.data;

        } catch (error) {
            console.error('Send email OTP error:', error);

            toast.error(
                error.response?.data?.message ||
                'Failed to send OTP'
            );

            return null;

        } finally {
            set({ isSendingOtp: false });
        }
    },

    // Request password reset OTP
    requestResetPasswordOtp: async (email) => {
        set({ isSendingOtp: true });

        try {
            const response = await axiosInstance.post(
                '/password/request-reset-password-otp',
                { email }
            );

            toast.success(
                response.data.message ||
                'OTP sent successfully!'
            );

            return response.data;

        } catch (error) {
            console.error('Reset OTP error:', error);

            toast.error(
                error.response?.data?.message ||
                'Failed to send OTP'
            );

            return null;

        } finally {
            set({ isSendingOtp: false });
        }
    },

    // Reset account password
    resetPassword: async ({
        email,
        newPassword,
        otp
    }) => {
        set({ isResettingPassword: true });

        try {
            const response = await axiosInstance.post(
                '/password/reset-password',
                {
                    email,
                    newPassword,
                    otp
                }
            );

            toast.success(
                response.data.message ||
                'Password reset successfully!'
            );

            return response.data;

        } catch (error) {
            console.error('Reset password error:', error);

            toast.error(
                error.response?.data?.message ||
                'Failed to reset password'
            );

            return null;

        } finally {
            set({ isResettingPassword: false });
        }
    },

    // Google authentication
    googleLogin: async ({ token }) => {
        set({ isLoggingIn: true });

        try {
            const response = await axiosInstance.post(
                '/auth/google-login',
                { token }
            );

            set({
                authUser: response.data.user ?? null
            });

            toast.success(
                response.data.message ||
                'Google Login successful!'
            );

            return response.data;

        } catch (error) {
            console.error('Google Login error:', error);

            toast.error(
                error.response?.data?.error ||
                'Google Login failed. Please try again.'
            );

            return null;

        } finally {
            set({ isLoggingIn: false });
        }
    },

    // Upload profile picture
    updateProfilePicture: async (formData) => {
        set({ isUploadingFile: true });

        try {
            const response = await axiosInstance.post(
                '/user/update-profile-picture',
                formData
            );

            set({
                authUser: response.data.user
            });

            toast.success(
                response.data.message ||
                'Profile picture updated successfully!'
            );

            return response.data;

        } catch (error) {
            console.error('Profile picture error:', error);

            toast.error(
                error.response?.data?.message ||
                'Failed to update profile picture'
            );

            return null;

        } finally {
            set({ isUploadingFile: false });
        }
    },

    // Get user by email
    getUserByEmail: async (email) => {
        try {
            const response = await axiosInstance.get(
                `/user/${encodeURIComponent(email)}`
            );

            return response.data.user;

        } catch (error) {
            console.error('Get user error:', error);
            return null;
        }
    }
}));
