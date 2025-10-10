import React, { useState } from "react";

export default function Dashboard({ startQuiz }) {
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const categories = ["general", "science", "math", "history", "sports"];
  const difficulties = ["easy", "medium", "hard"];

  return (
    <div className="flex justify-center p-6">
      <div className="w-full max-w-xl bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Start a Quiz</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            className="p-2 border rounded"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Choose category</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            className="p-2 border rounded"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="">Choose difficulty</option>
            {difficulties.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <div className="flex items-center">
            <button
              onClick={() => startQuiz({ category, difficulty })}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
