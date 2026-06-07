// routes/questionRoutes.js
import express from "express";
import { createQuestion, getQuestions } from "../controllers/questionController.js";
import { protectRoute, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Both PROFESSOR and FACULTY can hit this route
router.post(
  "/create",
  protectRoute,
  authorizeRoles("PROFESSOR", "FACULTY"),
  createQuestion
);
router.get("/", protectRoute, authorizeRoles("PROFESSOR", "FACULTY"), getQuestions);

export default router;