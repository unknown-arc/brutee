import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const StudentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    rollNumber: {
      type: String,
      required: true,
      unique: true,
    },

    department: {
      type: String,
      default: null,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    semester: {
      type: Number,
      default: 1,
      min: 1,
      max: 8,
    },

    status: {
      type: String,
      enum: [
        "ACTIVE",
        "BLOCKED",
      ],
      default: "ACTIVE",
    },

    examSessions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ExamSession",
      },
    ],
  },
  {
    timestamps: true,
    collection: "students",
  }
);

StudentSchema.pre(
  "save",
  async function (next) {
    if (
      !this.isModified(
        "password"
      )
    ) {
      return next();
    }

    const salt =
      await bcryptjs.genSalt(10);

    this.password =
      await bcryptjs.hash(
        this.password,
        salt
      );

    next();
  }
);

StudentSchema.methods.matchPassword =
  async function (
    enteredPassword
  ) {
    return bcryptjs.compare(
      enteredPassword,
      this.password
    );
  };

export default mongoose.model(
  "Student",
  StudentSchema
);
