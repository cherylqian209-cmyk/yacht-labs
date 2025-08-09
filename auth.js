/**
 * Authentication Link Handler
 * Fixes common authentication link process failures
 */

class AuthenticationLinkHandler {
    constructor(config = {}) {
        this.config = {
            baseUrl: config.baseUrl || 'https://www.yacht-labs.com',
            tokenExpiry: config.tokenExpiry || 3600000, // 1 hour
            allowedModes: ['signIn', 'resetPassword', 'verifyEmail'],
            ...config
        };
        this.pendingTokens = new Map();
    }

    /**
     * Generate authentication link with proper formatting
     * Fixes issue #1: Missing trailing slash in authentication links
     */
    generateAuthLink(mode, email, token) {
        if (!this.config.allowedModes.includes(mode)) {
            throw new Error(`Invalid mode: ${mode}. Allowed modes: ${this.config.allowedModes.join(', ')}`);
        }

        // Ensure trailing slash to prevent Firebase-like link issues
        const baseUrl = this.config.baseUrl.endsWith('/') 
            ? this.config.baseUrl 
            : this.config.baseUrl + '/';

        const params = new URLSearchParams({
            mode,
            email,
            token,
            timestamp: Date.now()
        });

        return `${baseUrl}auth/verify?${params.toString()}`;
    }

    /**
     * Detect and handle Outlook SafeLinks requests
     * Fixes issue #2: Outlook SafeLinks processing authentication links
     */
    isSafeLinksRequest(request) {
        const userAgent = request.headers['user-agent'] || '';
        const forwardedFor = request.headers['x-forwarded-for'] || '';
        
        // Common SafeLinks indicators
        const safeLinksIndicators = [
            'Microsoft Office',
            'ms-office',
            'SafeLinks',
            'protection.outlook.com'
        ];

        return safeLinksIndicators.some(indicator => 
            userAgent.includes(indicator) || forwardedFor.includes(indicator)
        );
    }

    /**
     * Process authentication link with proper validation
     * Fixes issue #3: Invalid or missing URL parameters
     */
    async processAuthLink(request) {
        try {
            const url = new URL(request.url);
            const params = url.searchParams;

            // Validate required parameters
            const mode = params.get('mode');
            const email = params.get('email');
            const token = params.get('token');
            const timestamp = params.get('timestamp');

            if (!mode || !email || !token) {
                return {
                    success: false,
                    error: 'Missing required parameters: mode, email, or token'
                };
            }

            if (!this.config.allowedModes.includes(mode)) {
                return {
                    success: false,
                    error: `Invalid mode: ${mode}`
                };
            }

            // Handle SafeLinks requests
            if (this.isSafeLinksRequest(request)) {
                console.log('SafeLinks request detected, returning 200 without processing token');
                return {
                    success: true,
                    safeLinksHandled: true,
                    message: 'SafeLinks request handled'
                };
            }

            // Check token expiry
            const tokenAge = Date.now() - parseInt(timestamp);
            if (tokenAge > this.config.tokenExpiry) {
                return {
                    success: false,
                    error: 'Authentication link has expired'
                };
            }

            // Validate token
            const isValidToken = await this.validateToken(token, email, mode);
            if (!isValidToken) {
                return {
                    success: false,
                    error: 'Invalid authentication token'
                };
            }

            // Process the authentication based on mode
            const result = await this.executeAuthAction(mode, email, token);
            
            // Clean up used token
            this.pendingTokens.delete(token);

            return {
                success: true,
                mode,
                email,
                result
            };

        } catch (error) {
            console.error('Authentication link processing error:', error);
            return {
                success: false,
                error: 'Failed to process authentication link'
            };
        }
    }

    /**
     * Validate authentication token
     */
    async validateToken(token, email, mode) {
        // In a real implementation, this would check against a database
        // For now, we'll implement basic validation
        
        if (!token || token.length < 32) {
            return false;
        }

        // Check if token is in pending tokens (prevent replay attacks)
        const pendingToken = this.pendingTokens.get(token);
        if (!pendingToken) {
            return false;
        }

        return pendingToken.email === email && pendingToken.mode === mode;
    }

    /**
     * Execute authentication action based on mode
     */
    async executeAuthAction(mode, email, token) {
        switch (mode) {
            case 'signIn':
                return await this.handleSignIn(email);
            case 'resetPassword':
                return await this.handlePasswordReset(email);
            case 'verifyEmail':
                return await this.handleEmailVerification(email);
            default:
                throw new Error(`Unsupported authentication mode: ${mode}`);
        }
    }

    async handleSignIn(email) {
        // Implementation for sign-in
        console.log(`Processing sign-in for: ${email}`);
        return { action: 'signIn', email, status: 'completed' };
    }

    async handlePasswordReset(email) {
        // Implementation for password reset
        console.log(`Processing password reset for: ${email}`);
        return { action: 'resetPassword', email, status: 'completed' };
    }

    async handleEmailVerification(email) {
        // Implementation for email verification
        console.log(`Processing email verification for: ${email}`);
        return { action: 'verifyEmail', email, status: 'completed' };
    }

    /**
     * Store pending token for validation
     */
    storePendingToken(token, email, mode) {
        this.pendingTokens.set(token, {
            email,
            mode,
            created: Date.now()
        });

        // Clean up expired tokens
        setTimeout(() => {
            this.pendingTokens.delete(token);
        }, this.config.tokenExpiry);
    }

    /**
     * Generate secure token
     */
    generateSecureToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthenticationLinkHandler;
}

// Usage example
const authHandler = new AuthenticationLinkHandler({
    baseUrl: 'https://www.yacht-labs.com',
    tokenExpiry: 3600000 // 1 hour
});

// Example of generating a secure authentication link
function createAuthenticationLink(mode, email) {
    const token = authHandler.generateSecureToken();
    authHandler.storePendingToken(token, email, mode);
    return authHandler.generateAuthLink(mode, email, token);
}

// Example usage:
// const signInLink = createAuthenticationLink('signIn', 'user@example.com');
// console.log('Authentication link:', signInLink);