import Student from "../models/Student.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign(
    {
      id,
      role: "STUDENT",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

// STUDENT LOGIN
export const studentLogin = async (
  req,
  res
) => {
  try {
    const { email, password } =
      req.body;

    const student =
      await Student.findOne({
        email,
      });

    if (!student) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid credentials",
      });
    }

    const isMatch =
      await student.matchPassword(
        password
      );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid credentials",
      });
    }

    const token =
      generateToken(student._id);

    res.status(200).json({
      success: true,
      token,

      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        rollNumber:
          student.rollNumber,
        role: "STUDENT",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET PROFILE
export const getStudentProfile =
  async (req, res) => {
    try {
      const userId = req.user._id || req.user.id;

      const student =
        await Student.findById(
          userId
        ).select("-password");

      if (!student) {
        return res.status(404).json({
          success: false,
          message:
            "Student not found",
        });
      }

      res.status(200).json({
        success: true,
        student,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };