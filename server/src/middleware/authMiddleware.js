import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Student from "../models/Student.js";

export const protectRoute = async (
  req,
  res,
  next
) => {
  try {
    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith(
        "Bearer "
      )
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Not authorized, no token",
      });
    }

    const token =
      authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    let user =
      await User.findById(
        decoded.id
      ).select("-password");

    if (!user) {
      const student =
        await Student.findById(
          decoded.id
        ).select("-password");

      if (student) {
        req.user = {
          ...student.toObject(),
          role: "STUDENT",
        };

        return next();
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "User not found",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message:
        "Not authorized, token failed",
    });
  }
};

export const authorizeRoles =
  (...allowedRoles) => {
    return (
      req,
      res,
      next
    ) => {
      if (
        !allowedRoles.includes(
          req.user.role
        )
      ) {
        return res.status(403).json({
          success: false,
          message: `Role (${req.user.role}) is not allowed to access this resource`,
        });
      }

      next();
    };
  };