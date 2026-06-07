// controllers/sessionController.js
import ExamSession from "../models/ExamSession.js";
import Exam from "../models/Exam.js";
import Question from "../models/Question.js";
import StudentResponse from "../models/StudentResponse.js";
import Result from "../models/Result.js";
import crypto from "crypto";

// 1. Desktop Client: Initialize Session & Generate QR Token
export const initializeSession = async (req, res) => {
  try {
    const { examId, candidateId } = req.body;

    // Verify the exam exists and is active
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    // Generate a secure, unique, random token for the QR code
    const pairingToken = crypto.randomBytes(32).toString("hex");

    // Create the session
    const session = await ExamSession.create({
      examId,
      candidateId,
      pairingToken,
    });

    res.status(201).json({
      message: "Session initialized. Display this token as a QR code.",
      sessionId: session._id,
      pairingToken, // The desktop client turns this string into a visual QR code
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Mobile App: Scan QR and Pair Device
export const pairMobileDevice = async (req, res) => {
  try {
    const { pairingToken, deviceInfo } = req.body;

    // Find the session associated with this token
    const session = await ExamSession.findOne({ pairingToken });

    if (!session) {
      return res.status(404).json({ message: "Invalid or expired QR code." });
    }

    if (session.isMobilePaired) {
      return res.status(400).json({ message: "Mobile device is already paired for this session." });
    }

    // Update the session to mark it as paired
    session.isMobilePaired = true;
    session.mobileDeviceInfo = deviceInfo || "Unknown Mobile Device";
    session.status = "ACTIVE"; // Exam can now officially start
    await session.save();

    // In a real scenario, you would emit a WebSocket event here 
    // to tell the Desktop client "Pairing Successful, start the exam!"

    res.status(200).json({
      message: "Mobile device paired successfully. Camera stream can begin.",
      sessionId: session._id
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Student: Get exam questions for taking the exam
export const getExamQuestions = async (req, res) => {
  try {
    const { examId } = req.params;

    // Find exam with questions
    const exam = await Exam.findById(examId)
      .populate({
        path: "questions",
        select: "question options marks subject",
      })
      .populate("subjectId", "name code");

    if (!exam) {
      return res.status(404).json({ success: false, message: "Exam not found" });
    }

    res.status(200).json({
      success: true,
      exam: {
        id: exam._id,
        title: exam.title,
        subject: exam.subjectId,
        duration: exam.durationMinutes,
        totalMarks: exam.totalMarks,
        instructions: exam.instructions || "",
        questions: exam.questions.map((q) => ({
          id: q._id,
          question: q.question,
          options: q.options,
          marks: q.marks,
        })),
      },
    });
  } catch (error) {
    console.error("Get exam questions error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 4. Student: Submit an answer for a question
export const submitAnswer = async (req, res) => {
  try {
    const { examSessionId, questionId, selectedAnswer } = req.body;

    // Find or create the response
    let response = await StudentResponse.findOne({
      examSession: examSessionId,
      question: questionId,
    });

    if (!response) {
      response = new StudentResponse({
        examSession: examSessionId,
        question: questionId,
        selectedAnswer,
      });
    } else {
      response.selectedAnswer = selectedAnswer;
    }

    await response.save();

    res.status(200).json({
      success: true,
      message: "Answer saved",
      response,
    });
  } catch (error) {
    console.error("Submit answer error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 5. Student: Submit exam (finalize answers)
export const submitExam = async (req, res) => {
  try {
    const { examSessionId } = req.params;

    // Find the exam session
    const session = await ExamSession.findById(examSessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    // Mark session as completed
    session.status = "COMPLETED";
    session.endTime = new Date();
    await session.save();

    // Get all responses for this session
    const responses = await StudentResponse.find({ examSession: examSessionId });

    // Calculate score
    let obtainedMarks = 0;
    for (let response of responses) {
      const question = await Question.findById(response.question);
      if (question && question.correctAnswer === response.selectedAnswer) {
        response.isCorrect = true;
        response.marksObtained = question.marks;
        obtainedMarks += question.marks;
      } else {
        response.isCorrect = false;
        response.marksObtained = 0;
      }
      await response.save();
    }

    // Get exam for total marks
    const exam = await Exam.findById(session.examId);
    const totalMarks = exam.totalMarks;
    const percentage = (obtainedMarks / totalMarks) * 100;

    // Create result
    const result = await Result.create({
      examSession: examSessionId,
      exam: session.examId,
      student: session.candidateId,
      totalMarks,
      obtainedMarks,
      percentage,
      responses: responses.map((r) => r._id),
      submittedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Exam submitted successfully",
      result: {
        id: result._id,
        totalMarks: result.totalMarks,
        obtainedMarks: result.obtainedMarks,
        percentage: result.percentage.toFixed(2),
      },
    });
  } catch (error) {
    console.error("Submit exam error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 6. Get exam session status and details
export const getSessionStatus = async (req, res) => {
  try {
    const { examSessionId } = req.params;

    const session = await ExamSession.findById(examSessionId)
      .populate("examId", "title duration totalMarks")
      .populate("candidateId", "name rollNumber");

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    res.status(200).json({
      success: true,
      session: {
        id: session._id,
        status: session.status,
        exam: session.examId,
        candidate: session.candidateId,
        startTime: session.startTime,
        endTime: session.endTime,
        isMobilePaired: session.isMobilePaired,
      },
    });
  } catch (error) {
    console.error("Get session status error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 7. Get student result
export const getResult = async (req, res) => {
  try {
    const { examSessionId } = req.params;

    const result = await Result.findOne({ examSession: examSessionId })
      .populate("exam", "title subject")
      .populate("responses");

    if (!result) {
      return res.status(404).json({ success: false, message: "Result not found" });
    }

    res.status(200).json({
      success: true,
      result: {
        id: result._id,
        exam: result.exam,
        totalMarks: result.totalMarks,
        obtainedMarks: result.obtainedMarks,
        percentage: result.percentage.toFixed(2),
        status: result.status,
        responses: result.responses,
        submittedAt: result.submittedAt,
      },
    });
  } catch (error) {
    console.error("Get result error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};