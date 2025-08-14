// middleware/clientauthmiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/Client/clientuser');

const authMiddleware = async (req, res, next) => {
  try {
    console.log("AuthMiddleware: Method=" + req.method + ", URL=" + req.url);
    console.log("Parsed cookies:", req.cookies);

    // Get token from cookies (primary) or Authorization header (fallback)
    let token = req.cookies.token || req.cookies.authToken;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      console.log("No token found in cookies or headers");
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    console.log("Token received:", token.substring(0, 10) + "...");

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded:", decoded);

    // Find user by ID from token
    const user = await User.findById(decoded.id).select('-password -resetCode');
    
    if (!user) {
      console.log("User not found for ID:", decoded.id);
      return res.status(401).json({ message: 'User not found. Invalid token.' });
    }

    console.log("Authentication successful:", {
      id: user._id,
      email: user.email,
      name: user.name
    });

    // Set user data on request object with both _id and id for compatibility
    req.user = {
      _id: user._id,
      id: user._id, // Add this for compatibility
      email: user.email,
      name: user.name,
      gender: user.gender
    };

    next();
  } catch (error) {
    console.error("AuthMiddleware error:", {
      message: error.message,
      name: error.name,
      stack: error.stack
    });

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    
    res.status(500).json({ message: 'Server error during authentication.' });
  }
};

module.exports = authMiddleware;