// routes/sessionRoutes.js
import express from "express";
import { initializeSession, pairMobileDevice } from "../controllers/sessionController.js";

const router = express.Router();

// Called by the Desktop Client
router.post("/initialize", initializeSession);

// Called by the Mobile Camera App when scanning the QR
router.post("/pair", pairMobileDevice);

export default router;