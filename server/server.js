import dns from 'node:dns/promises';
dns.setServers(['1.1.1.1', '8.8.8.8']);
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./src/routes/authRoutes.js";
import subjectRoutes from "./src/routes/subjectRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import facultyRoutes from "./src/routes/facultyRoutes.js";
import questionRoutes from "./src/routes/questionRoutes.js";
import examRoutes from "./src/routes/examRoutes.js";
import sessionRoutes from "./src/routes/sessionRoutes.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.log("DB Connection Error: ", err));

// Mount Routes
app.get('/', (req, res) => {
    res.json({message : "Backend Working!"})
})
app.use("/api/auth", authRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/sessions", sessionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});