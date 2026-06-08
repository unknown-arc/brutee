import express from "express";
import {
  studentLogin,
  getStudentProfile,
} from "../controllers/studentController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", studentLogin);
router.get("/profile", protectRoute, getStudentProfile);

export default router;
