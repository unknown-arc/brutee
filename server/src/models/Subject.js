import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    subjectCode: { type: String, required: true, unique: true },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", // Super Admin ID
      required: true 
    },
    assignedProfessor: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", // Professor ID
      default: null 
    }
  },
  { timestamps: true }
);

export default mongoose.model("Subject", subjectSchema);