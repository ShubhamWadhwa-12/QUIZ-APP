import React, { useEffect, useState, useRef } from "react";
import { api } from "../api/client";
import { speak } from "../utils/speech";

export default function QuizPlay({ token, quizOptions, onFinish }) {
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api(
      `/quiz?category=${quizOptions.category}&difficulty=${quizOptions.difficulty}`,
      { token }
    )
      .then((r) => {
        if (mounted) setQuestions(r.questions || r);
      })
      .catch((e) => setErr(e.message))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [quizOptions, token]);

  useEffect(() => {
    setTimeLeft(30);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t === 1) {
          handleNext();
          return 30;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [idx]);
  const handleSelect = (qIndex, option) =>
    setAnswers((prev) => ({ ...prev, [qIndex]: option }));

  const handleNext = () =>
    idx < questions.length - 1 ? setIdx(idx + 1) : handleSubmit();
  const handlePrev = () => idx > 0 && setIdx(idx - 1);

  const handleSpeak = () => {
    const q = questions[idx];
    if (!q) return;
    speak(`${idx + 1}. ${q.question}. Options: ${q.options.join(", ")}`);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        answers: Object.entries(answers).map(([q, ans]) => ({
          questionIndex: Number(q),
          answer: ans,
        })),
      };
      const result = await api(`/quiz/submit`, {
        method: "POST",
        token,
        body: payload,
      });
      onFinish(result);
    } catch (e) {
      setErr(e.message);
    }
  };

  if (loading) return <div className="p-6">Loading questions...</div>;
  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;
  if (!questions.length) return <div className="p-6">No questions found.</div>;

  const q = questions[idx];
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">
          Question {idx + 1} / {questions.length}
        </h3>
        <div className="text-sm">Time: {timeLeft}s</div>
      </div>
      <div className="mt-4">
        <div className="mb-2 text-lg font-medium">{q.question}</div>
        <div className="grid gap-2">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleSelect(idx, opt)}
              className={`text-left p-3 border rounded ${
                answers[idx] === opt
                  ? "ring-2 ring-green-400"
                  : "hover:bg-gray-50"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={handlePrev}
            disabled={idx === 0}
            className="px-3 py-1 border rounded"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            Next
          </button>
          <button onClick={handleSpeak} className="px-3 py-1 border rounded">
            Speak
          </button>
          <button
            onClick={handleSubmit}
            className="ml-auto px-3 py-1 bg-green-600 text-white rounded"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
