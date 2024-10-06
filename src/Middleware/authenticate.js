const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    
    if (!token) {
      return res.status(403).json({ message: "Token required" });
    }
  
    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Invalid token" });
      }
      
      req.user = user; // Attach user information to the request
      next();
    });
  };
  
  const isAdmin = (req, res, next) => {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };

const isValidUser = (req, res, next) => {
    if (req.user.id !== req.id) {
        return res.status(403).json({ message: "Invalid User" });
    }
    next();
};

module.exports = {
    authenticateToken,
    isAdmin,
    isValidUser,
};
