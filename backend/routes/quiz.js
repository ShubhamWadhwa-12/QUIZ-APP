import express from "express";
import axios from "axios";
import Question from "../models/Question.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/*
GET /quiz?category=math&difficulty=easy&amount=10
- Looks in DB for matching questions (category/difficulty). If not enough, fetches from OpenTDB, saves them, and returns.
*/
router.get("/", requireAuth, async (req, res) => {
  try {
    const { category = "general", difficulty = "easy", amount = 10 } = req.query;
    // find existing questions
    let questions = await Question.find({ category, difficulty }).limit(Number(amount)).lean();

    if (questions.length < Number(amount)) {
      // fetch remaining from OpenTDB
      const need = Number(amount) - questions.length;
      const tparams = new URLSearchParams({
        amount: String(need),
        difficulty,
        type: "multiple",
      });
      // Optionally map your category to OpenTDB category id — for simplicity we skip and let OpenTDB randomize.
      const url = `${process.env.OPEN_TDB_API}?${tparams.toString()}`;

      const resp = await axios.get(url);
      if (resp.data && resp.data.results) {
        const fetched = resp.data.results.map((it) => {
          const options = [...it.incorrect_answers, it.correct_answer].map(decodeHTMLEntities);
          // shuffle options
          for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
          }
          return {
            sourceId: null,
            category,
            difficulty,
            question: decodeHTMLEntities(it.question),
            correct_answer: decodeHTMLEntities(it.correct_answer),
            incorrect_answers: it.incorrect_answers.map(decodeHTMLEntities),
            options,
          };
        });
        const inserted = await Question.insertMany(fetched);
        questions = questions.concat(inserted);
      }
    }

    // trim to requested amount and return
    questions = questions.slice(0, Number(amount)).map(q => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      difficulty: q.difficulty,
      category: q.category
    }));

    res.json({ questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Cannot fetch questions" });
  }
});

// small helper to decode HTML entities from OpenTDB
function decodeHTMLEntities(text) {
  if (!text) return text;
  return text.replace(/&([^;]+);/g, (m, code) => {
    const map = {
      quot: '"', amp: "&", lt: "<", gt: ">", apos: "'",
      nbsp: " ", rsquo: "’", ldquo: "“", rdquo: "”", hellip: "…"
    };
    if (map[code]) return map[code];
    // numeric
    if (code.startsWith("#x")) return String.fromCharCode(parseInt(code.substring(2), 16));
    if (code.startsWith("#")) return String.fromCharCode(parseInt(code.substring(1), 10));
    return m;
  });
}

export default router;