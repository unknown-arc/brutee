import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema(
  {
    examSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExamSession",
      required: true,
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    obtainedMarks: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "EVALUATED", "PUBLISHED"],
      default: "PENDING",
    },
    responses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StudentResponse",
      },
    ],
    submittedAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const Result = mongoose.model("Result", ResultSchema);
export default Result;
