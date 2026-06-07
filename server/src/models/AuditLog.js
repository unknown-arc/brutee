// models/AuditLog.js
import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true, // e.g., "CREATED_EXAM", "ADDED_QUESTION", "ADDED_FACULTY"
    },
    resourceType: {
      type: String,
      required: true, // e.g., "Exam", "Question", "User"
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true, // The ID of the item that was affected
    },
    description: {
      type: String, // Additional details
    },
    ipAddress: {
      type: String, // Good for security tracking
    }
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);