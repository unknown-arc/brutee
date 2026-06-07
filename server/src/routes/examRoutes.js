// routes/examRoutes.js
import express from "express";
import { createExam, getExams } from "../controllers/examController.js";
import { protectRoute, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// PROFESSOR ONLY: Route to create a new exam paper
router.post(
  "/create",
  protectRoute,
  authorizeRoles("PROFESSOR"),
  createExam
);
router.get("/", protectRoute, authorizeRoles("PROFESSOR"), getExams);

export default router;