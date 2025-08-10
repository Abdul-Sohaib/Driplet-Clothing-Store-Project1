// backend/middleware/auth.js
const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

const client = jwksClient({
  jwksUri: process.env.CLERK_JWKS_URL,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.error("Error fetching signing key:", err.message);
      return callback(err);
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("Missing or invalid Authorization header");
    return res.status(401).json({ message: "Unauthorized: Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(
    token,
    getKey,
    {
      issuer: process.env.CLERK_ISSUER,
      algorithms: ["RS256"],
      ignoreNotBefore: true, // Skip nbf validation
    },
    (err, decoded) => {
      if (err) {
        console.error("Token verification failed:", err.message);
        return res.status(401).json({ message: "Invalid token", error: err.message });
      }
      req.auth = decoded;
      console.log("Token verified for user:", decoded.sub);
      next();
    }
  );
};

module.exports = authMiddleware;