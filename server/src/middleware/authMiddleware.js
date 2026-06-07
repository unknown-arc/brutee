import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Student from "../models/Student.js";

export const protectRoute = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Try to fetch as staff user first
      let user = await User.findById(decoded.id).select("-password");
      
      // If not found, try to fetch as student
      if (!user) {
        user = await Student.findById(decoded.id).select("-password");
        if (user) {
          user.role = 'STUDENT'; // Ensure role is set for students
        }
      }
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    if (!token) {
      res.status(401).json({ message: "Not authorized, no token" });
    }
  }
};

// Check if user has specific role
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Role (${req.user.role}) is not allowed to access this resource.` 
      });
    }
    next();
  };
};