const jwt = require("jsonwebtoken");
const User = require("../models/Client/clientuser");

const authMiddleware = async (req, res, next) => {
  try {
    console.log(`[${new Date().toISOString()}] AuthMiddleware: Method=${req.method}, URL=${req.url}`);
    console.log("Request headers:", {
      authorization: req.headers.authorization || "None",
      cookie: req.headers.cookie || "None",
      origin: req.headers.origin || "None",
      'user-agent': req.headers['user-agent']?.substring(0, 50) + '...' || "None"
    });
    console.log("Parsed cookies:", req.cookies || "None");

    let token = null;
    
    // Try to get token from cookies first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log("Token found in cookies");
    }
    
    // Fallback to Authorization header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
      console.log("Token found in Authorization header");
    }

    console.log("Token received:", token ? `Present (${token.substring(0, 10)}...)` : "Missing");

    if (!token) {
      console.log("Authentication failed: No token provided");
      return res.status(401).json({ 
        message: "Not authorized, no token",
        debug: {
          cookiesReceived: !!req.cookies,
          authHeaderReceived: !!req.headers.authorization,
          environment: process.env.NODE_ENV
        }
      });
    }

    let decoded;
    try {
      if (!process.env.JWT_SECRET) {
        console.error("CRITICAL: JWT_SECRET is not defined");
        return res.status(500).json({ message: "Server configuration error" });
      }
      
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token successfully decoded:", {
        id: decoded.id,
        issued: new Date(decoded.iat * 1000).toISOString(),
        expires: new Date(decoded.exp * 1000).toISOString(),
        timeUntilExpiry: Math.round((decoded.exp * 1000 - Date.now()) / 1000 / 60) + " minutes"
      });
      
      // Check if token is expired
      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        console.error("Token has expired");
        return res.status(401).json({ message: "Not authorized, token expired" });
      }
      
    } catch (err) {
      console.error("Token verification error:", {
        name: err.name,
        message: err.message,
        tokenLength: token ? token.length : 0
      });
      
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Not authorized, token expired" });
      } else if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: "Not authorized, invalid token" });
      } else {
        return res.status(401).json({ message: "Not authorized, token verification failed" });
      }
    }

    // Find user in database
    const user = await User.findById(decoded.id).select("-password -resetCode");
    if (!user) {
      console.error("User not found in database for ID:", decoded.id);
      return res.status(401).json({ 
        message: "Not authorized, user not found",
        debug: { userId: decoded.id }
      });
    }

    console.log("Authentication successful:", { 
      id: user._id.toString(), 
      email: user.email, 
      name: user.name,
      loginTime: new Date().toISOString()
    });
    
    req.user = user;
    next();
    
  } catch (err) {
    console.error("Authentication middleware error:", {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method
    });
    res.status(401).json({ 
      message: "Not authorized, authentication failed",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

module.exports = authMiddleware;