// src/middleware/firebaseAuthMiddleware.js
const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK once
if (!admin.apps.length) {
  try {
    let credential;
    
    // Production: Use environment variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      console.log('[FIREBASE ADMIN] Using service account from environment variable');
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      credential = admin.credential.cert(serviceAccount);
    } 
    // Development: Use local file
    else {
      console.log('[FIREBASE ADMIN] Using service account from local file');
      const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));
      credential = admin.credential.cert(serviceAccount);
    }
    
    admin.initializeApp({
      credential: credential,
    });
    
    console.log('[FIREBASE ADMIN] ✓ Initialized successfully');
  } catch (error) {
    console.error('[FIREBASE ADMIN] ✗ Initialization failed:', error.message);
    
    if (process.env.NODE_ENV === 'production') {
      console.error('ERROR: FIREBASE_SERVICE_ACCOUNT environment variable not set or invalid JSON');
      console.error('Please add your Firebase service account JSON as an environment variable in Render');
    } else {
      console.error('ERROR: Make sure serviceAccountKey.json exists in Backend folder');
    }
    
    process.exit(1);
  }
}

/**
 * Firebase Auth Middleware
 * Verifies Firebase ID tokens and syncs with MongoDB
 */
const firebaseAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Log the incoming request for debugging
    console.log('[FIREBASE AUTH] Request:', {
      url: req.url,
      method: req.method,
      hasAuth: !!authHeader,
      authHeader: authHeader ? authHeader.substring(0, 20) + '...' : 'none'
    });

    if (!authHeader?.startsWith('Bearer ')) {
      console.log('[FIREBASE AUTH] ✗ No Bearer token provided');
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided',
        requiresAuth: true
      });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    if (!idToken || idToken.trim() === '') {
      console.log('[FIREBASE AUTH] ✗ Empty token');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token format',
        requiresAuth: true
      });
    }

    // Verify Firebase token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken, true); // checkRevoked = true
      console.log('[FIREBASE AUTH] ✓ Token verified:', decodedToken.email);
    } catch (verifyError) {
      console.error('[FIREBASE AUTH] ✗ Token verification failed:', verifyError.code);
      
      if (verifyError.code === 'auth/id-token-expired') {
        return res.status(401).json({ 
          success: false, 
          message: 'Token expired',
          requiresAuth: true,
          tokenExpired: true
        });
      }
      
      if (verifyError.code === 'auth/argument-error') {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid token format',
          requiresAuth: true
        });
      }

      if (verifyError.code === 'auth/id-token-revoked') {
        return res.status(401).json({ 
          success: false, 
          message: 'Token revoked. Please login again.',
          requiresAuth: true
        });
      }
      
      throw verifyError;
    }

    // Find or create user in MongoDB
    const User = require('../models/Client/clientuser');
    const user = await User.findOneAndUpdate(
      { email: decodedToken.email },
      {
        firebaseUid: decodedToken.uid,
        name: decodedToken.name || decodedToken.email.split('@')[0],
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified || false,
        photoURL: decodedToken.picture || '',
        lastLogin: new Date(),
      },
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true 
      }
    );

    // Attach user info to request
    req.user = {
      id: decodedToken.uid,
      _id: user._id,
      email: decodedToken.email,
      name: user.name,
      gender: user.gender || '',
      mongoUser: user,
    };

    console.log('[FIREBASE AUTH] ✓ User authenticated:', req.user.email);
    next();
    
  } catch (error) {
    console.error('[FIREBASE AUTH] ✗ Unexpected error:', {
      message: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication failed',
      requiresAuth: true,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = firebaseAuthMiddleware;