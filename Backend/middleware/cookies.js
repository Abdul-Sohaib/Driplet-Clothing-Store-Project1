// middleware/cookies.js
const config = require('../config/production');

const setAuthCookie = (res, token) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction, // Only secure in production
      sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-site in production, 'lax' for development
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    };

    // Set domain only in production if specified in config
    if (isProduction && config.COOKIE_DOMAIN) {
      cookieOptions.domain = config.COOKIE_DOMAIN;
    }

    console.log('Setting auth cookie with options:', {
      ...cookieOptions,
      token: token.substring(0, 10) + '...',
      environment: process.env.NODE_ENV
    });

    res.cookie('token', token, cookieOptions);
    res.cookie('authToken', token, cookieOptions); // Backup cookie name
    
    return res;
  } catch (error) {
    console.error('Error setting auth cookie:', error);
    throw error;
  }
};

const clearAuthCookie = (res) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/'
    };

    // Set domain only in production if specified in config
    if (isProduction && config.COOKIE_DOMAIN) {
      cookieOptions.domain = config.COOKIE_DOMAIN;
    }

    console.log('Clearing auth cookies with options:', {
      ...cookieOptions,
      environment: process.env.NODE_ENV
    });

    res.clearCookie('token', cookieOptions);
    res.clearCookie('authToken', cookieOptions);
    
    return res;
  } catch (error) {
    console.error('Error clearing auth cookie:', error);
    throw error;
  }
};

module.exports = {
  setAuthCookie,
  clearAuthCookie
};