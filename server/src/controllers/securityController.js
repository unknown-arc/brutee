// controllers/securityController.js
import ExamSession from "../models/ExamSession.js";

export const verifyClientIntegrity = async (req, res) => {
  try {
    const { sessionId, clientHash } = req.body;

    // In a real production environment, this expected hash comes from your 
    // database configurations or an environment variable. 
    // It represents the SHA-256 hash of your official compiled PySide6 executable.
    const EXPECTED_CLIENT_HASH = process.env.OFFICIAL_CLIENT_HASH || "secure_mock_hash_123";

    if (!clientHash || clientHash !== EXPECTED_CLIENT_HASH) {
      // If the hash doesn't match, the app was tampered with
      return res.status(403).json({ 
        verified: false, 
        message: "Application integrity check failed. Unauthorized or tampered client detected." 
      });
    }

    // Optional: Log this successful verification against the session
    if (sessionId) {
      await ExamSession.findByIdAndUpdate(sessionId, { 
        $set: { "status": "INTEGRITY_VERIFIED" } 
      });
    }

    res.status(200).json({
      verified: true,
      message: "Application integrity verified successfully. Secure connection established."
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};