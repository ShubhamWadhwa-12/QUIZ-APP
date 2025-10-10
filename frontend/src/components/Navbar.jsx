import React from "react";

export default function Navbar({ user, onLogout, go }) {
  return (
    <header className="bg-white shadow p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">QuizLab</h1>
        <nav className="hidden md:flex gap-2 text-sm text-gray-600">
          <button onClick={() => go("dashboard")} className="hover:underline">
            Dashboard
          </button>
          <button onClick={() => go("results")} className="hover:underline">
            My Results
          </button>
        </nav>
      </div>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="text-sm">{user.name}</span>
            <button
              onClick={onLogout}
              className="px-3 py-1 bg-red-500 text-white rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => go("auth")}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            Login / Signup
          </button>
        )}
      </div>
    </header>
  );
}
