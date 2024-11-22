// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken'); // Import JWT
require('dotenv').config(); // Load environment variables

const JWT_SECRET = process.env.JWT_SECRET; // Get the secret from .env

const authMiddleware = (req, res, next) => {
  // Get the token from the Authorization header
  const token = req.headers.authorization?.split(' ')[1];

  // If no token is provided, deny access
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized, no token provided' });
  }

  // Verify the token
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized, invalid token' });
    }

    // If token is valid, store the decoded user info in the request object
    req.user = decoded; // `decoded` contains the user info (e.g., userId, email)
    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = authMiddleware;
