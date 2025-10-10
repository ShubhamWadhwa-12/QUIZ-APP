import express from "express";
import Result from "../models/Result.js";
import Question from "../models/Question.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/*
POST /quiz/submit
Body: { answers: [{ questionIndex: Number (not used), questionId?, answer? or questionText? ... }], category, difficulty }
We accept answers array of objects: { questionId, answer } OR { questionText, answer }.
*/
router.post("/submit", requireAuth, async (req, res) => {
  try {
    const { answers = [], category = "general", difficulty = "easy" } = req.body;
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "No answers provided" });
    }

    // Build detailed answers and score
    let correctCount = 0;
    const details = [];

    for (const ans of answers) {
      let qdoc = null;
      if (ans.questionId) qdoc = await Question.findById(ans.questionId).lean();
      if (!qdoc && ans.questionText) qdoc = await Question.findOne({ question: ans.questionText }).lean();

      const correct = qdoc ? qdoc.correct_answer : ans.correct; // fallback if provided
      const isCorrect = String(ans.answer).trim() === String(correct).trim();
      if (isCorrect) correctCount++;

      details.push({
        questionId: qdoc ? qdoc._id : null,
        questionText: qdoc ? qdoc.question : ans.questionText || "",
        chosen: ans.answer,
        correct: correct || null,
        isCorrect,
      });
    }

    const total = answers.length;
    const score = correctCount;

    // save result
    const result = await Result.create({
      user: req.user._id,
      score,
      total,
      category,
      difficulty,
      answers: details,
    });

    res.json({
      score,
      total,
      resultId: result._id,
      details,
      createdAt: result.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to grade quiz" });
  }
});

// GET /results/:userId
router.get("/:userId", requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    // ensure user can only fetch their own results unless you add admin checks
    if (String(req.user._id) !== String(userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const results = await Result.find({ user: userId }).sort({ createdAt: -1 }).lean();
    res.json({ results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Cannot fetch results" });
  }
});

export default router;