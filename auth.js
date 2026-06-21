/**
 * Authentication Service
 * Handles auth state and user session
 */

class AuthService {
    constructor() {
        this.currentUser = null;
        this.isLoading = false;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!localStorage.getItem('authToken');
    }

    /**
     * Get current user from localStorage
     */
    getCurrentUser() {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    }

    /**
     * Set current user in localStorage
     */
    setCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUser = user;
    }

    /**
     * Register new user
     */
    async register(userData) {
        this.isLoading = true;
        try {
            const response = await api.register(userData);
            
            // Store user data
            this.setCurrentUser(response.user);
            
            return {
                success: true,
                message: response.message,
                user: response.user
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Login user
     */
    async login(email, password) {
        this.isLoading = true;
        try {
            const response = await api.login(email, password);
            
            // Store user data
            this.setCurrentUser(response.user);
            
            return {
                success: true,
                message: response.message,
                user: response.user
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            await api.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            this.currentUser = null;
            window.location.href = 'login.html';
        }
    }

    /**
     * Get current user info from API
     */
    async fetchCurrentUser() {
        try {
            const response = await api.getCurrentUser();
            this.setCurrentUser(response.user);
            return response.user;
        } catch (error) {
            // Token invalid or expired
            this.logout();
            return null;
        }
    }

    /**
     * Forgot password
     */
    async forgotPassword(email) {
        try {
            await api.forgotPassword(email);
            return {
                success: true,
                message: 'Password reset email sent. Check your inbox.'
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * Reset password
     */
    async resetPassword(resetToken, password) {
        try {
            await api.resetPassword(resetToken, password);
            return {
                success: true,
                message: 'Password reset successful. You can now login.'
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }
}

// Create global instance
const auth = new AuthService();

// Check auth on page load
window.addEventListener('load', () => {
    if (auth.isAuthenticated()) {
        auth.fetchCurrentUser();
    }
});
