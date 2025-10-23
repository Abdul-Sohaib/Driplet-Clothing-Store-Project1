const config = require('../config/production');

const setAuthCookie = (res, token, options = {}) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    
    // More permissive settings for development/localhost
    const defaultOptions = {
      httpOnly: true,
      secure: false, // CHANGED: Set to false for localhost testing
      sameSite: 'lax', // CHANGED: Use 'lax' for better compatibility
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    };

    const cookieOptions = { ...defaultOptions, ...options };

    // Only set domain in production AND only if explicitly configured
    if (isProduction && config?.COOKIE_DOMAIN) {
      cookieOptions.domain = config.COOKIE_DOMAIN;
      cookieOptions.secure = true; // Enable secure only in production with domain
      cookieOptions.sameSite = 'none'; // Required for cross-domain in production
    }

    console.log('[COOKIE] Setting auth cookies with options:', {
      ...cookieOptions,
      token: token?.substring(0, 15) + '...',
      environment: process.env.NODE_ENV,
      isProduction,
      hasDomain: !!cookieOptions.domain
    });

    // Set both token names for redundancy
    res.cookie('token', token, cookieOptions);
    res.cookie('authToken', token, cookieOptions);
    
    // Log cookie headers being set
    console.log('[COOKIE] Response Set-Cookie headers:', res.getHeaders()['set-cookie']);
    
    return res;
  } catch (error) {
    console.error('[COOKIE] Error setting auth cookie:', error.message);
    throw error;
  }
};

const clearAuthCookie = (res, options = {}) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    
    const defaultOptions = {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/'
    };

    const cookieOptions = { ...defaultOptions, ...options };

    if (isProduction && config?.COOKIE_DOMAIN) {
      cookieOptions.domain = config.COOKIE_DOMAIN;
      cookieOptions.secure = true;
      cookieOptions.sameSite = 'none';
    }

    console.log('[COOKIE] Clearing auth cookies with options:', {
      ...cookieOptions,
      environment: process.env.NODE_ENV
    });

    res.clearCookie('token', cookieOptions);
    res.clearCookie('authToken', cookieOptions);
    
    return res;
  } catch (error) {
    console.error('[COOKIE] Error clearing auth cookie:', error.message);
    throw error;
  }
};

module.exports = {
  setAuthCookie,
  clearAuthCookie
};