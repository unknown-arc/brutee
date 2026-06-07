// controllers/facultyController.js
import { Faculty } from "../models/User.js";
import Subject from "../models/Subject.js";
import bcrypt from "bcryptjs";

export const createFaculty = async (req, res) => {
  try {
    const { name, email, password, permissions } = req.body;

    // 1. Find the subject that this specific Professor manages
    // req.user._id comes from the logged-in Professor's token
    const subject = await Subject.findOne({ assignedProfessor: req.user._id });
    
    if (!subject) {
      return res.status(403).json({ 
        message: "Action denied: You are not assigned to manage any subject yet." 
      });
    }

    // 2. Hash the password for the new faculty member
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create the Faculty document
    // We pass permissions dynamically, or fallback to defaults
    const newFaculty = await Faculty.create({
      name,
      email,
      password: hashedPassword,
      assignedSubject: subject._id,
      reportingTo: req.user._id, 
      permissions: permissions || { 
        canCreateQuestion: true, 
        canEditSyllabus: false 
      }
    });

    res.status(201).json({
      message: "Faculty member successfully added to your subject",
      faculty: {
        _id: newFaculty._id,
        name: newFaculty.name,
        email: newFaculty.email,
        role: newFaculty.role,
        permissions: newFaculty.permissions
      },
      subject: subject.name
    });

  } catch (error) {
    // Handle duplicate email constraint from MongoDB
    if (error.code === 11000) {
      return res.status(400).json({ message: "Faculty with this email already exists" });
    }
    res.status(500).json({ error: error.message });
  }
};

// Fetch faculty added by this specific professor
export const getFaculty = async (req, res) => {
  try {
    const facultyList = await Faculty.find({ reportingTo: req.user._id })
      .select("-password") // Never send passwords to frontend
      .populate("assignedSubject", "name");
      
    res.status(200).json(facultyList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};