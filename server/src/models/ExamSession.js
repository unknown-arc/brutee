// models/ExamSession.js
import mongoose from "mongoose";

const examSessionSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    candidateId: {
      type: String, // String reference since student data is handled elsewhere
      required: true,
    },
    pairingToken: {
      type: String, // The token embedded in the QR code
      unique: true,
      required: true,
    },
    isMobilePaired: {
      type: Boolean,
      default: false,
    },
    mobileDeviceInfo: {
      type: String, // To log which device scanned the QR (e.g., "iPhone 13", "Android")
      default: null,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "COMPLETED", "TERMINATED"],
      default: "PENDING",
    },
    currentRiskScore: {
      type: Number,
      default: 0, // AI will update this score dynamically
    }
  },
  { timestamps: true }
);

export default mongoose.model("ExamSession", examSessionSchema);