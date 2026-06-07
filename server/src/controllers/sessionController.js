// controllers/sessionController.js
import ExamSession from "../models/ExamSession.js";
import Exam from "../models/Exam.js";
import crypto from "crypto";

// 1. Desktop Client: Initialize Session & Generate QR Token
export const initializeSession = async (req, res) => {
  try {
    const { examId, candidateId } = req.body;

    // Verify the exam exists and is active
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    // Generate a secure, unique, random token for the QR code
    const pairingToken = crypto.randomBytes(32).toString("hex");

    // Create the session
    const session = await ExamSession.create({
      examId,
      candidateId,
      pairingToken,
    });

    res.status(201).json({
      message: "Session initialized. Display this token as a QR code.",
      sessionId: session._id,
      pairingToken, // The desktop client turns this string into a visual QR code
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Mobile App: Scan QR and Pair Device
export const pairMobileDevice = async (req, res) => {
  try {
    const { pairingToken, deviceInfo } = req.body;

    // Find the session associated with this token
    const session = await ExamSession.findOne({ pairingToken });

    if (!session) {
      return res.status(404).json({ message: "Invalid or expired QR code." });
    }

    if (session.isMobilePaired) {
      return res.status(400).json({ message: "Mobile device is already paired for this session." });
    }

    // Update the session to mark it as paired
    session.isMobilePaired = true;
    session.mobileDeviceInfo = deviceInfo || "Unknown Mobile Device";
    session.status = "ACTIVE"; // Exam can now officially start
    await session.save();

    // In a real scenario, you would emit a WebSocket event here 
    // to tell the Desktop client "Pairing Successful, start the exam!"

    res.status(200).json({
      message: "Mobile device paired successfully. Camera stream can begin.",
      sessionId: session._id
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};