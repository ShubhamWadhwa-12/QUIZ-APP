import React, { useEffect, useState } from "react";
import { api } from "../api/client";

export default function ResultsView({ token, userId }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    api(`/results/${userId}`, { token })
      .then((r) => setResults(r.results || r))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [token, userId]);

  if (loading) return <div className="p-6">Loading results...</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Past Results</h2>
      {results.length === 0 ? (
        <div>No results yet — take a quiz!</div>
      ) : (
        <ul className="space-y-3">
          {results.map((r, i) => (
            <li key={i} className="p-3 border rounded">
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold">Score: {r.score}</div>
                  <div className="text-sm text-gray-600">
                    Category: {r.category} • {r.difficulty}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(r.createdAt).toLocaleString()}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
