// routes/securityRoutes.js
import express from "express";
import { verifyClientIntegrity } from "../controllers/securityController.js";

const router = express.Router();

// The PySide6 desktop client will hit this route before letting the student start the exam
router.post("/verify-integrity", verifyClientIntegrity);

export default router;