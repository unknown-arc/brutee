// models/Exam.js
import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Will be the Professor
      required: true,
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    durationMinutes: {
      type: Number,
      required: true, // e.g., 60 minutes
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    startTime: {
      type: Date,
      required: true, // Scheduled start time
    },
    isActive: {
      type: Boolean,
      default: false, // Will be true when exam goes live
    },
    status: {
      type: String,
      enum: [
        "DRAFT",
        "SCHEDULED",
        "ACTIVE",
        "COMPLETED"
      ],
      default: "DRAFT"
    },

    isPublished: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("Exam", examSchema);