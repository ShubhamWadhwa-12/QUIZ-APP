import mongoose from "mongoose";

const AnswerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
  questionText: String,
  chosen: String,
  correct: String,
  isCorrect: Boolean,
});

const ResultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  score: Number,
  total: Number,
  category: String,
  difficulty: String,
  answers: [AnswerSchema],
}, { timestamps: true });

export default mongoose.model("Result", ResultSchema);