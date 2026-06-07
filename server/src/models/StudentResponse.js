import mongoose from "mongoose";

const StudentResponseSchema = new mongoose.Schema(
  {
    examSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExamSession",
      required: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    selectedAnswer: {
      type: String,
      required: true,
    },
    isCorrect: {
      type: Boolean,
      default: null,
    },
    marksObtained: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const StudentResponse = mongoose.model("StudentResponse", StudentResponseSchema);
export default StudentResponse;
