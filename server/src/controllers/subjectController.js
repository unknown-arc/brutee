import Subject from "../models/Subject.js";
import { Professor } from "../models/User.js";

// CREATE SUBJECT
export const createSubject = async (
  req,
  res
) => {
  try {
    const { name, subjectCode } =
      req.body;

    const subjectExists =
      await Subject.findOne({
        subjectCode,
      });

    if (subjectExists) {
      return res.status(400).json({
        success: false,
        message:
          "Subject code already exists",
      });
    }

    const subject =
      await Subject.create({
        name,
        subjectCode,
        createdBy: req.user._id,
      });

    res.status(201).json({
      success: true,
      message:
        "Subject created successfully",
      subject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL SUBJECTS
export const getSubjects = async (
  req,
  res
) => {
  try {
    if (
      req.user.role ===
      "SUPER_ADMIN"
    ) {
      const subjects =
        await Subject.find()
          .populate(
            "assignedProfessor",
            "name email"
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        success: true,
        count: subjects.length,
        subjects,
      });
    }

    if (
      req.user.role ===
      "PROFESSOR"
    ) {
      const subjects =
        await Subject.find({
          assignedProfessor:
            req.user._id,
        }).populate(
          "assignedProfessor",
          "name email"
        );

      return res.status(200).json({
        success: true,
        count: subjects.length,
        subjects,
      });
    }

    return res.status(403).json({
      success: false,
      message: "Unauthorized",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE SUBJECT
export const getSubjectById =
  async (req, res) => {
    try {
      const subject =
        await Subject.findById(
          req.params.id
        ).populate(
          "assignedProfessor",
          "name email"
        );

      if (!subject) {
        return res.status(404).json({
          success: false,
          message:
            "Subject not found",
        });
      }

      res.status(200).json({
        success: true,
        subject,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

// UPDATE SUBJECT
export const updateSubject =
  async (req, res) => {
    try {
      const {
        name,
        subjectCode,
      } = req.body;

      const subject =
        await Subject.findById(
          req.params.id
        );

      if (!subject) {
        return res.status(404).json({
          success: false,
          message:
            "Subject not found",
        });
      }

      subject.name =
        name || subject.name;

      subject.subjectCode =
        subjectCode ||
        subject.subjectCode;

      await subject.save();

      res.status(200).json({
        success: true,
        message:
          "Subject updated successfully",
        subject,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

// DELETE SUBJECT
export const deleteSubject =
  async (req, res) => {
    try {
      const subject =
        await Subject.findById(
          req.params.id
        );

      if (!subject) {
        return res.status(404).json({
          success: false,
          message:
            "Subject not found",
        });
      }

      await subject.deleteOne();

      res.status(200).json({
        success: true,
        message:
          "Subject deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

// ASSIGN PROFESSOR
export const assignProfessor =
  async (req, res) => {
    try {
      const {
        subjectId,
        professorId,
      } = req.body;

      const subject =
        await Subject.findById(
          subjectId
        );

      if (!subject) {
        return res.status(404).json({
          success: false,
          message:
            "Subject not found",
        });
      }

      const professor =
        await Professor.findById(
          professorId
        );

      if (!professor) {
        return res.status(404).json({
          success: false,
          message:
            "Professor not found",
        });
      }

      subject.assignedProfessor =
        professor._id;

      await subject.save();

      res.status(200).json({
        success: true,
        message:
          "Professor assigned successfully",
        subject,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };