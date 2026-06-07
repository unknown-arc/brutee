// models/AiAlert.js
import mongoose from "mongoose";

const aiAlertSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExamSession",
      required: true,
    },
    alertType: {
      type: String,
      required: true, // e.g., "MOBILE_PHONE_DETECTED", "MULTIPLE_PERSONS", "CANDIDATE_ABSENT"
    },
    confidenceScore: {
      type: Number,
      required: true, // e.g., 0.95 for 95% AI confidence
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    // Optional: URL to the snapshot saved in your cloud storage
    snapshotUrl: {
      type: String,
      default: null,
    }
  },
  { timestamps: true }
);

export default mongoose.model("AiAlert", aiAlertSchema);