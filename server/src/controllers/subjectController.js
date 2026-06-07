// controllers/subjectController.js
import Subject from "../models/Subject.js";

export const createSubject = async (req, res) => {
  try {
    const { name, subjectCode } = req.body;

    // Check if subject code already exists
    const subjectExists = await Subject.findOne({ subjectCode });
    if (subjectExists) {
      return res.status(400).json({ message: "Subject Code already exists" });
    }

    // Create new subject
    const subject = await Subject.create({
      name,
      subjectCode,
      createdBy: req.user._id, // This comes from our authMiddleware
    });

    res.status(201).json({
      message: "Subject created successfully",
      subject,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch subjects based on role
export const getSubjects = async (req, res) => {
  try {
    if (req.user.role === "SUPER_ADMIN") {
      // Super Admin sees all subjects
      const subjects = await Subject.find().populate("assignedProfessor", "name email");
      return res.status(200).json(subjects);
    } else if (req.user.role === "PROFESSOR") {
      // Professor only sees their assigned subject
      const subject = await Subject.findOne({ assignedProfessor: req.user._id });
      return res.status(200).json(subject ? [subject] : []);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};