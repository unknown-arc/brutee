// models/Question.js
import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    options: [
      {
        type: String,
        required: true, // Multiple choice options stored as an array of strings
      },
    ],
    correctAnswer: {
      type: String,
      required: true,
    },
    marks: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);