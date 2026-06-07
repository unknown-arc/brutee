// controllers/questionController.js
import Question from "../models/Question.js";
import Subject from "../models/Subject.js";

export const createQuestion = async (req, res) => {
  try {
    const { questionText, options, correctAnswer, marks } = req.body;
    const user = req.user; // Comes from our protectRoute middleware
    let targetSubjectId = null;

    // Logic for PROFESSOR
    if (user.role === "PROFESSOR") {
      const subject = await Subject.findOne({ assignedProfessor: user._id });
      if (!subject) {
        return res.status(403).json({ message: "You are not assigned to any subject." });
      }
      targetSubjectId = subject._id;
    } 
    
    // Logic for FACULTY
    else if (user.role === "FACULTY") {
      // Check specific permission
      if (!user.permissions || user.permissions.canCreateQuestion !== true) {
        return res.status(403).json({ 
          message: "Permission denied: You do not have the right to create questions." 
        });
      }
      targetSubjectId = user.assignedSubject;
    }

    // Ensure options array is valid
    if (!options || options.length < 2) {
      return res.status(400).json({ message: "Provide at least two options." });
    }

    // Create the Question
    const newQuestion = await Question.create({
      subjectId: targetSubjectId,
      createdBy: user._id,
      questionText,
      options,
      correctAnswer,
      marks: marks || 1,
    });

    res.status(201).json({
      message: "Question added successfully to the question bank",
      question: newQuestion,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch question bank for the subject
export const getQuestions = async (req, res) => {
  try {
    let subjectId;

    if (req.user.role === "PROFESSOR") {
      const subject = await Subject.findOne({ assignedProfessor: req.user._id });
      if (!subject) return res.status(200).json([]);
      subjectId = subject._id;
    } else if (req.user.role === "FACULTY") {
      subjectId = req.user.assignedSubject;
    }

    const questions = await Question.find({ subjectId })
      .populate("createdBy", "name role");
      
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};