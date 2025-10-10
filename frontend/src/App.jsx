import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import AuthForm from "./components/Authform";
import Dashboard from "./components/Dashboard";
import QuizPlay from "./components/QuizPlay";
import ResultsView from "./components/ResultsView";
import { api } from "./api/client";
import { getToken, removeToken } from "./utils/auth";

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("dashboard");
  const [quizOptions, setQuizOptions] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  useEffect(() => {
    const token = getToken();
    if (token) {
      api("/auth/me", { token })
        .then((r) => setUser(r.user))
        .catch(() => {});
    }
  }, []);

  const handleLogout = () => {
    removeToken();
    setUser(null);
    setView("dashboard");
  };

  const startQuiz = (opts) => {
    if (!user) {
      setView("auth");
      return;
    }
    if (!opts.category || !opts.difficulty) {
      alert("Please choose category and difficulty");
      return;
    }
    setQuizOptions(opts);
    setView("quiz");
  };

  const handleFinish = (result) => {
    setLastResult(result);
    setView("resultDetail");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col w-full">
      <Navbar user={user} onLogout={handleLogout} go={setView} />
      <div className="flex justify-center py-6 px-4">
        <div className="w-full max-w-3xl">
          {view === "dashboard" && <Dashboard startQuiz={startQuiz} />}
          {view === "auth" && (
            <AuthForm
              onLogin={(u) => {
                setUser(u);
                setView("dashboard");
              }}
            />
          )}
          {view === "quiz" && user && (
            <QuizPlay
              token={getToken()}
              quizOptions={quizOptions}
              onFinish={handleFinish}
            />
          )}
          {view === "resultDetail" && lastResult && (
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-semibold mb-2">Quiz Result</h2>
              <div className="mb-4">
                Score: <span className="font-bold">{lastResult.score}</span>
              </div>
              <pre className="bg-gray-50 p-3 rounded mt-2 text-sm overflow-auto">
                {JSON.stringify(lastResult, null, 2)}
              </pre>
              <button
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                onClick={() => setView("results")}
              >
                Back to Results
              </button>
            </div>
          )}
          {view === "results" && user && (
            <ResultsView
              token={getToken()}
              userId={user._id}
              onSelect={(r) => {
                setLastResult(r);
                setView("resultDetail");
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
