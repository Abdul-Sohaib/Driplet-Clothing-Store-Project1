const jwt = require("jsonwebtoken");
const User = require("../models/Client/clientuser");

const authMiddleware = async (req, res, next) => {
  try {
    console.log(`[${new Date().toISOString()}] AuthMiddleware: Method=${req.method}, URL=${req.url}`);
    console.log("Cookies:", req.cookies || "None");
    console.log("Authorization header:", req.headers.authorization || "None");

    let token = req.cookies ? req.cookies.token : null;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    console.log("Token received:", token ? `Present (${token.substring(0, 10)}...)` : "Missing");

    if (!token) {
      console.log("Authentication failed: No token provided");
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    let decoded;
    try {
      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not defined");
        return res.status(500).json({ message: "Server configuration error" });
      }
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", {
        id: decoded.id,
        issued: new Date(decoded.iat * 1000).toISOString(),
        expires: new Date(decoded.exp * 1000).toISOString(),
      });
    } catch (err) {
      console.error("Token verification error:", err.message);
      return res.status(401).json({ message: "Not authorized, invalid or expired token" });
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.error("User not found for ID:", decoded.id);
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    console.log("Authenticated user:", { id: user._id.toString(), email: user.email, name: user.name });
    req.user = user;
    next();
  } catch (err) {
    console.error("Authentication error:", err.message);
    res.status(401).json({ message: "Not authorized, authentication failed" });
  }
};

module.exports = authMiddleware;