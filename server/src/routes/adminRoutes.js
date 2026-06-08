import express from "express";

import {
  seedSuperAdmin,
  createProfessor,
  getProfessors,
  getProfessorById,
  updateProfessor,
  deleteProfessor,
} from "../controllers/adminController.js";

import {
  protectRoute,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| INITIAL SETUP
|--------------------------------------------------------------------------
*/

// REMOVE IN PRODUCTION
router.post("/seed", seedSuperAdmin);

/*
|--------------------------------------------------------------------------
| PROFESSOR MANAGEMENT
|--------------------------------------------------------------------------
*/

// Create Professor
router.post(
  "/professors",
  protectRoute,
  authorizeRoles("SUPER_ADMIN"),
  createProfessor
);

// Get All Professors
router.get(
  "/professors",
  protectRoute,
  authorizeRoles("SUPER_ADMIN"),
  getProfessors
);

// Get Single Professor
router.get(
  "/professors/:id",
  protectRoute,
  authorizeRoles("SUPER_ADMIN"),
  getProfessorById
);

// Update Professor
router.put(
  "/professors/:id",
  protectRoute,
  authorizeRoles("SUPER_ADMIN"),
  updateProfessor
);

// Delete Professor
router.delete(
  "/professors/:id",
  protectRoute,
  authorizeRoles("SUPER_ADMIN"),
  deleteProfessor
);

export default router;