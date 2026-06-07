import mongoose from "mongoose";

const baseOptions = {
  discriminatorKey: "role",
  collection: "users",
  timestamps: true,
};

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "PROFESSOR", "FACULTY"],
      required: true,
    },
  },
  baseOptions
);

const User = mongoose.model("User", UserSchema);

export const SuperAdmin = User.discriminator(
  "SUPER_ADMIN",
  new mongoose.Schema({}, { _id: false })
);

export const Professor = User.discriminator(
  "PROFESSOR",
  new mongoose.Schema(
    {
      department: { type: String, default: null },
    },
    { _id: false }
  )
);

export const Faculty = User.discriminator(
  "FACULTY",
  new mongoose.Schema(
    {
      assignedSubject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
      },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      permissions: {
        canCreateQuestion: { type: Boolean, default: true },
        canEditSyllabus: { type: Boolean, default: false },
      },
    },
    { _id: false }
  )
);

export default User;
