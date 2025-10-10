import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  sourceId: { type: String }, // optional, for external id
  category: { type: String, default: "general" },
  difficulty: { type: String, default: "medium" },
  question: { type: String, required: true },
  correct_answer: { type: String, required: true },
  incorrect_answers: { type: [String], default: [] },
  options: { type: [String], default: [] }, // shuffled options
}, { timestamps: true });

export default mongoose.model("Question", QuestionSchema);
