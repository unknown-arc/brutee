import bcrypt from "bcryptjs";
import { Faculty } from "../models/User.js";
import Subject from "../models/Subject.js";

// CREATE FACULTY
export const createFaculty = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      permissions,
    } = req.body;

    const existingFaculty =
      await Faculty.findOne({ email });

    if (existingFaculty) {
      return res.status(400).json({
        success: false,
        message:
          "Faculty with this email already exists",
      });
    }

    const subject =
      await Subject.findOne({
        assignedProfessor: req.user._id,
      });

    if (!subject) {
      return res.status(403).json({
        success: false,
        message:
          "You are not assigned to any subject",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const faculty =
      await Faculty.create({
        name,
        email,
        password: hashedPassword,

        assignedSubject: subject._id,

        reportingTo: req.user._id,

        permissions:
          permissions || {
            canCreateQuestion: true,
            canEditQuestion: false,
            canDeleteQuestion: false,

            canCreateExam: false,
            canEditExam: false,

            canViewStudents: true,
            canManageStudents: false,

            canViewResults: true,
          },
      });

    res.status(201).json({
      success: true,
      message:
        "Faculty created successfully",
      faculty,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL FACULTY OF PROFESSOR
export const getFaculty = async (
  req,
  res
) => {
  try {
    const facultyList =
      await Faculty.find({
        reportingTo: req.user._id,
      })
        .select("-password")
        .populate(
          "assignedSubject",
          "name subjectCode"
        );

    res.status(200).json({
      success: true,
      count: facultyList.length,
      faculty: facultyList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE FACULTY
export const getFacultyById = async (
  req,
  res
) => {
  try {
    const faculty =
      await Faculty.findById(
        req.params.id
      )
        .select("-password")
        .populate(
          "assignedSubject",
          "name subjectCode"
        );

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message:
          "Faculty not found",
      });
    }

    res.status(200).json({
      success: true,
      faculty,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE FACULTY
export const updateFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(
      req.params.id
    );

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    // SECURITY CHECK
    if (
      faculty.reportingTo.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized action",
      });
    }

    const {
      name,
      email,
      permissions,
    } = req.body;

    faculty.name =
      name || faculty.name;

    faculty.email =
      email || faculty.email;

    if (permissions) {
      faculty.permissions =
        permissions;
    }

    await faculty.save();

    res.status(200).json({
      success: true,
      message:
        "Faculty updated successfully",
      faculty,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE FACULTY
export const deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(
      req.params.id
    );

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    // SECURITY CHECK
    if (
      faculty.reportingTo.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized action",
      });
    }

    await faculty.deleteOne();

    res.status(200).json({
      success: true,
      message:
        "Faculty deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};