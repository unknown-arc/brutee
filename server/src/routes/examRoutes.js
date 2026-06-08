import express from "express";

import {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
  publishExam,
  getAvailableExams,
} from "../controllers/examController.js";

import {
  protectRoute,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| PROFESSOR EXAM MANAGEMENT
|--------------------------------------------------------------------------
*/

// Create Exam
router.post(
  "/",
  protectRoute,
  authorizeRoles("PROFESSOR"),
  createExam
);

// Get All Exams Created By Professor
router.get(
  "/",
  protectRoute,
  authorizeRoles("PROFESSOR"),
  getExams
);

// Get Single Exam
router.get(
  "/:id",
  protectRoute,
  authorizeRoles("PROFESSOR"),
  getExamById
);

// Update Exam
router.put(
  "/:id",
  protectRoute,
  authorizeRoles("PROFESSOR"),
  updateExam
);

// Delete Exam
router.delete(
  "/:id",
  protectRoute,
  authorizeRoles("PROFESSOR"),
  deleteExam
);

// Publish / Activate Exam
router.patch(
  "/:id/publish",
  protectRoute,
  authorizeRoles("PROFESSOR"),
  publishExam
);

/*
|--------------------------------------------------------------------------
| STUDENT EXAM ACCESS
|--------------------------------------------------------------------------
*/

// Available Exams For Students
router.get(
  "/available/list",
  protectRoute,
  authorizeRoles("STUDENT"),
  getAvailableExams
);

export default router;