import express from "express";
import { seedSuperAdmin, createProfessor } from "../controllers/adminController.js";
import { protectRoute, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route just for initial setup (REMOVE IN PRODUCTION)
router.post("/seed", seedSuperAdmin);

// Protected route: Only SUPER_ADMIN can create a Professor
router.post(
  "/create-professor",
  protectRoute,
  authorizeRoles("SUPER_ADMIN"),
  createProfessor
);

export default router;