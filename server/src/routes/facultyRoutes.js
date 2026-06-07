// routes/facultyRoutes.js
import express from "express";
import { createFaculty } from "../controllers/facultyController.js";
import { protectRoute, authorizeRoles } from "../middleware/authMiddleware.js";
import { getFaculty } from "../controllers/facultyController.js";

const router = express.Router();

// PROFESSOR ONLY: Route to add a new Faculty member
router.post(
  "/create",
  protectRoute,
  authorizeRoles("PROFESSOR"),
  createFaculty
);
router.get("/", protectRoute, authorizeRoles("PROFESSOR"), getFaculty);

export default router;