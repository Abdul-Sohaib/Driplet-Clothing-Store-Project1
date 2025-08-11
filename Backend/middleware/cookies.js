/**
 * Centralized Cookie Configuration
 * 
 * This middleware provides consistent cookie settings for both development and production.
 * 
 * DEVELOPMENT MODE:
 * - httpOnly: true (security)
 * - secure: false (allows HTTP for localhost)
 * - sameSite: 'lax' (allows cross-site requests in development)
 * 
 * PRODUCTION MODE:
 * - httpOnly: true (security)
 * - secure: true (HTTPS only)
 * - sameSite: 'none' (required for cross-site cookies in production)
 * 
 * TO UPDATE FOR PRODUCTION:
 * 1. Set NODE_ENV=production in your environment
 * 2. Ensure your frontend is served over HTTPS
 * 3. Cookies will automatically use production settings
 */

/**
 * Get cookie options based on environment
 * @param {Object} options - Additional cookie options
 * @returns {Object} Cookie configuration object
 */
const getCookieOptions = (options = {}) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const baseOptions = {
    httpOnly: true, // Prevents XSS attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    ...options
  };
  
  if (isDevelopment) {
    return {
      ...baseOptions,
      secure: false, // Allow HTTP in development
      sameSite: 'lax' // Allows cross-site requests in development
    };
  }
  
  // Production settings
  return {
    ...baseOptions,
    secure: true, // HTTPS only in production
    sameSite: 'none' // Required for cross-site cookies in production
  };
};

/**
 * Set authentication token cookie
 * @param {Object} res - Express response object
 * @param {string} token - JWT token
 * @param {Object} options - Additional cookie options
 */
const setAuthCookie = (res, token, options = {}) => {
  const cookieOptions = getCookieOptions({
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    ...options
  });
  
  res.cookie('token', token, cookieOptions);
};

/**
 * Clear authentication token cookie
 * @param {Object} res - Express response object
 */
const clearAuthCookie = (res) => {
  const cookieOptions = getCookieOptions({
    expires: new Date(0) // Expire immediately
  });
  
  res.cookie('token', '', cookieOptions);
};

/**
 * Set a custom cookie with environment-appropriate settings
 * @param {Object} res - Express response object
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {Object} options - Additional cookie options
 */
const setCustomCookie = (res, name, value, options = {}) => {
  const cookieOptions = getCookieOptions(options);
  res.cookie(name, value, cookieOptions);
};

/**
 * Clear a custom cookie
 * @param {Object} res - Express response object
 * @param {string} name - Cookie name
 */
const clearCustomCookie = (res, name) => {
  const cookieOptions = getCookieOptions({
    expires: new Date(0) // Expire immediately
  });
  
  res.cookie(name, '', cookieOptions);
};

module.exports = {
  getCookieOptions,
  setAuthCookie,
  clearAuthCookie,
  setCustomCookie,
  clearCustomCookie
};
