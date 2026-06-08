import Question from "../models/Question.js";
import Subject from "../models/Subject.js";

// CREATE QUESTION
export const createQuestion = async (
  req,
  res
) => {
  try {
    const {
      questionText,
      options,
      correctAnswer,
      marks,
    } = req.body;

    let subjectId = null;

    // PROFESSOR
    if (
      req.user.role ===
      "PROFESSOR"
    ) {
      const subject =
        await Subject.findOne({
          assignedProfessor:
            req.user._id,
        });

      if (!subject) {
        return res.status(403).json({
          success: false,
          message:
            "No subject assigned",
        });
      }

      subjectId = subject._id;
    }

    // FACULTY
    else if (
      req.user.role === "FACULTY"
    ) {
      if (
        !req.user.permissions
          ?.canCreateQuestion
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Permission denied",
        });
      }

      subjectId =
        req.user.assignedSubject;
    }

    if (
      !questionText ||
      !options ||
      options.length < 2
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid question data",
      });
    }

    if (
      !options.includes(
        correctAnswer
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Correct answer must exist in options",
      });
    }

    const question =
      await Question.create({
        subjectId,
        createdBy: req.user._id,
        questionText,
        options,
        correctAnswer,
        marks: marks || 1,
      });

    res.status(201).json({
      success: true,
      message:
        "Question created successfully",
      question,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET QUESTIONS
export const getQuestions =
  async (req, res) => {
    try {
      let subjectId;

      if (
        req.user.role ===
        "PROFESSOR"
      ) {
        const subject =
          await Subject.findOne({
            assignedProfessor:
              req.user._id,
          });

        if (!subject) {
          return res.status(200).json({
            success: true,
            questions: [],
          });
        }

        subjectId = subject._id;
      }

      if (
        req.user.role ===
        "FACULTY"
      ) {
        subjectId =
          req.user.assignedSubject;
      }

      const questions =
        await Question.find({
          subjectId,
        })
          .populate(
            "createdBy",
            "name role"
          )
          .sort({
            createdAt: -1,
          });

      res.status(200).json({
        success: true,
        count: questions.length,
        questions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

// GET SINGLE QUESTION
export const getQuestionById =
  async (req, res) => {
    try {
      const question =
        await Question.findById(
          req.params.id
        ).populate(
          "createdBy",
          "name role"
        );

      if (!question) {
        return res.status(404).json({
          success: false,
          message:
            "Question not found",
        });
      }

      res.status(200).json({
        success: true,
        question,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

// UPDATE QUESTION
export const updateQuestion =
  async (req, res) => {
    try {
      const question =
        await Question.findById(
          req.params.id
        );

      if (!question) {
        return res.status(404).json({
          success: false,
          message:
            "Question not found",
        });
      }

      question.questionText =
        req.body.questionText ||
        question.questionText;

      question.options =
        req.body.options ||
        question.options;

      question.correctAnswer =
        req.body.correctAnswer ||
        question.correctAnswer;

      question.marks =
        req.body.marks ||
        question.marks;

      await question.save();

      res.status(200).json({
        success: true,
        message:
          "Question updated successfully",
        question,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

// DELETE QUESTION
export const deleteQuestion =
  async (req, res) => {
    try {
      const question =
        await Question.findById(
          req.params.id
        );

      if (!question) {
        return res.status(404).json({
          success: false,
          message:
            "Question not found",
        });
      }

      await question.deleteOne();

      res.status(200).json({
        success: true,
        message:
          "Question deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };