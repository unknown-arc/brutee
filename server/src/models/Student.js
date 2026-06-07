import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const StudentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rollNumber: { type: String, required: true, unique: true },
    department: { type: String, default: null },
    enrolledSubjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],
    examsSessions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ExamSession",
      },
    ],
  },
  { timestamps: true, collection: "students" }
);

// Hash password before saving
StudentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
StudentSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

const Student = mongoose.model("Student", StudentSchema);
export default Student;
