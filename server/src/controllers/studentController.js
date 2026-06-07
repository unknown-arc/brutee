import Student from "../models/Student.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id, role: "STUDENT" }, process.env.JWT_SECRET || "secret", {
    expiresIn: "30d",
  });
};

export const studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    // Find student by email
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Check password
    const isPasswordValid = await student.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(student._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        role: "STUDENT",
      },
    });
  } catch (error) {
    console.error("Student login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const studentRegister = async (req, res) => {
  try {
    const { name, email, password, rollNumber } = req.body;

    // Validate input
    if (!name || !email || !password || !rollNumber) {
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({ $or: [{ email }, { rollNumber }] });
    if (existingStudent) {
      return res
        .status(400)
        .json({ success: false, message: "Student with this email or roll number already exists" });
    }

    // Create new student
    const student = new Student({
      name,
      email,
      password,
      rollNumber,
    });

    await student.save();

    // Generate token
    const token = generateToken(student._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        role: "STUDENT",
      },
    });
  } catch (error) {
    console.error("Student registration error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id)
      .select("-password")
      .populate("enrolledSubjects");

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.status(200).json({ success: true, student });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
