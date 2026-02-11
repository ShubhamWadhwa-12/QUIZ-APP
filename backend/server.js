import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import quizRoutes from "./routes/quiz.js";
import resultsRoutes from "./routes/results.js";

dotenv.config();

const PORT = process.env.PORT || 4000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10kb" }));

// Connect DB
connectDB(process.env.MONGO_URI).catch(err => {
  console.error("DB connection failed:", err);
  process.exit(1);
});

// Routes
app.use("/auth", authRoutes);
app.use("/quiz", quizRoutes);
app.use("/quiz", resultsRoutes); // note: submit uses /quiz/submit; results uses /quiz/:userId? But we exposed results as /quiz/submit and /results/:userId earlier in frontend. To align with frontend, we will also mount results separately below.

// Provide /results routes
import resultsRoutes2 from "./routes/results.js";
app.use("/results", resultsRoutes2);

// Basic ready check
app.get("/", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});