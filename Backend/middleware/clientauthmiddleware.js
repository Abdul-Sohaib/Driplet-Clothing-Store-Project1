const jwt = require('jsonwebtoken');
const User = require('../models/Client/clientuser');

const clientAuthMiddleware = async (req, res, next) => {
  try {
    console.log('[AUTH] Method=' + req.method + ', URL=' + req.path);

    // Extract token from cookies (primary) or headers (fallback)
    let token = req.cookies?.token || req.cookies?.authToken;
    
    if (!token) {
      // Try Authorization header
      const authHeader = req.headers.authorization;
      if (authHeader) {
        if (authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        } else {
          token = authHeader;
        }
      }
    }

    if (!token) {
      console.warn('[AUTH] No token found in cookies or headers for path:', req.path);
      console.warn('[AUTH] Available cookies:', Object.keys(req.cookies || {}));
      console.warn('[AUTH] Authorization header:', req.headers.authorization ? 'present' : 'missing');
      
      return res.status(401).json({ 
        success: false,
        message: 'No token found. Please authenticate.' 
      });
    }

    console.log('[AUTH] Token found, attempting verification...');

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user from database
    const user = await User.findById(decoded.id).select('-password -resetCode');
    
    if (!user) {
      console.warn('[AUTH] User not found for token ID:', decoded.id);
      return res.status(401).json({ 
        success: false,
        message: 'User not found. Invalid token.' 
      });
    }

    // Attach user to request with both _id and id for compatibility
    req.user = {
      _id: user._id,
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      gender: user.gender || ''
    };

    console.log('[AUTH] Authentication successful for user:', req.user.email);
    next();
    
  } catch (error) {
    console.error('[AUTH] Middleware error:', {
      message: error.message,
      name: error.name
    });

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired. Please log in again.' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Authentication error.' 
    });
  }
};

module.exports = clientAuthMiddleware;