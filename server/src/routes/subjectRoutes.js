import express from "express";
import { createSubject, getSubjects } from "../controllers/subjectController.js";
import { protectRoute, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only SUPER_ADMIN can hit this POST route
router.post(
  "/create",
  protectRoute,
  authorizeRoles("SUPER_ADMIN"),
  createSubject
);
router.get("/", protectRoute, authorizeRoles("SUPER_ADMIN", "PROFESSOR"), getSubjects);

export default router;