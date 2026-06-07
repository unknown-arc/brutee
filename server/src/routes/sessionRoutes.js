// routes/sessionRoutes.js
import express from "express";
import {
  initializeSession,
  pairMobileDevice,
  getExamQuestions,
  submitAnswer,
  submitExam,
  getSessionStatus,
  getResult,
} from "../controllers/sessionController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// Called by the Desktop Client
router.post("/initialize", initializeSession);

// Called by the Mobile Camera App when scanning the QR
router.post("/pair", pairMobileDevice);

// Student: Get exam questions for taking the exam
router.get("/exam/:examId/questions", protectRoute, getExamQuestions);

// Student: Submit an answer for a question
router.post("/answer/submit", protectRoute, submitAnswer);

// Student: Submit exam (finalize answers)
router.post("/:examSessionId/submit", protectRoute, submitExam);

// Get exam session status
router.get("/:examSessionId/status", protectRoute, getSessionStatus);

// Get student result
router.get("/:examSessionId/result", protectRoute, getResult);

export default router;