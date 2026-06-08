import express from "express";

import {
  createFaculty,
  getFaculty,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
} from "../controllers/facultyController.js";

import {
  protectRoute,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| FACULTY MANAGEMENT
|--------------------------------------------------------------------------
*/

// Create Faculty
router.post(
  "/",
  protectRoute,
  authorizeRoles("PROFESSOR"),
  createFaculty
);

// Get All Faculty
router.get(
  "/",
  protectRoute,
  authorizeRoles(
    "PROFESSOR",
    "SUPER_ADMIN"
  ),
  getFaculty
);

// Get Single Faculty
router.get(
  "/:id",
  protectRoute,
  authorizeRoles(
    "PROFESSOR",
    "SUPER_ADMIN"
  ),
  getFacultyById
);

// Update Faculty
router.put(
  "/:id",
  protectRoute,
  authorizeRoles("PROFESSOR"),
  updateFaculty
);

// Delete Faculty
router.delete(
  "/:id",
  protectRoute,
  authorizeRoles("PROFESSOR"),
  deleteFaculty
);

export default router;
