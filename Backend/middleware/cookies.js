/**
 * Centralized Cookie Configuration
 * 
 * DEVELOPMENT MODE: httpOnly: true, secure: false, sameSite: 'lax'
 * PRODUCTION MODE: httpOnly: true, secure: true, sameSite: 'none'
 * 
 * TO UPDATE FOR PRODUCTION:
 * 1. Set NODE_ENV=production
 * 2. Ensure HTTPS
 * 3. Cookies will use production settings
 */

const prodConfig = require('../config/production');

/**
 * Get cookie options based on environment
 * @param {Object} options - Additional cookie options
 * @returns {Object} Cookie configuration object
 */
// Update the production cookie settings to be more permissive during development
const getCookieOptions = (options = {}) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const baseOptions = {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
    ...options
  };
  
  if (isProduction) {
    return {
      ...baseOptions,
      secure: true,
      sameSite: 'none',
      domain: prodConfig.COOKIE_DOMAIN || undefined
    };
  }
  
  // Development settings - make these more permissive
  return {
    ...baseOptions,
    secure: false,
    sameSite: 'lax',
    domain: 'localhost' // Explicitly set domain for development
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
  
  console.log(`🍪 Setting auth cookie: token=${token.substring(0, 10)}..., options=`, cookieOptions);
  
  res.cookie('token', token, cookieOptions);
  
  // Additional fallback cookie without httpOnly for debugging (remove in production if not needed)
  if (process.env.NODE_ENV !== 'production') {
    res.cookie('token_debug', token.substring(0, 20) + '...', {
      ...cookieOptions,
      httpOnly: false
    });
  }
};

/**
 * Clear authentication token cookie
 * @param {Object} res - Express response object
 */
const clearAuthCookie = (res) => {
  const cookieOptions = getCookieOptions({
    expires: new Date(0),
    maxAge: 0
  });
  
  console.log(`🍪 Clearing auth cookie`);
  
  res.cookie('token', '', cookieOptions);
  
  // Also clear debug cookie
  if (process.env.NODE_ENV !== 'production') {
    res.cookie('token_debug', '', {
      ...cookieOptions,
      httpOnly: false
    });
  }
};

/**
 * Set a custom cookie with environment-appropriate settings
 * @param {Object} res - Express response object
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {Object} options - Additional cookie options
 */
const setCustomCookie = (res, name, value, options = {}) => {
  const cookieOptions = getCookieOptions({
    maxAge: 24 * 60 * 60 * 1000, // 1 day default
    ...options
  });
  console.log(`🍪 Setting custom cookie: ${name}=${value}, options=`, cookieOptions);
  res.cookie(name, value, cookieOptions);
};

/**
 * Clear a custom cookie
 * @param {Object} res - Express response object
 * @param {string} name - Cookie name
 */
const clearCustomCookie = (res, name) => {
  const cookieOptions = getCookieOptions({
    expires: new Date(0),
    maxAge: 0
  });
  
  console.log(`🍪 Clearing custom cookie: ${name}`);
  
  res.cookie(name, '', cookieOptions);
};

module.exports = {
  getCookieOptions,
  setAuthCookie,
  clearAuthCookie,
  setCustomCookie,
  clearCustomCookie
};