import React, { useState } from "react";
import { api } from "../api/client";
import { saveToken } from "../utils/auth";

export default function AuthForm({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      if (mode === "login") {
        const r = await api("/auth/login", {
          method: "POST",
          body: { email, password },
        });
        saveToken(r.token);
        onLogin(r.user);
      } else {
        const r = await api("/auth/signup", {
          method: "POST",
          body: { name, email, password },
        });
        saveToken(r.token);
        onLogin(r.user);
      }
    } catch (error) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">
        {mode === "login" ? "Login" : "Create account"}
      </h2>
      <form onSubmit={submit} className="space-y-3">
        {mode === "signup" && (
          <input
            className="w-full p-2 border rounded"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
          className="w-full p-2 border rounded"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <div className="flex items-center gap-2">
          <button
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Login"
              : "Sign up"}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-sm text-gray-600 underline"
          >
            {mode === "login" ? "Create account" : "Already have an account?"}
          </button>
        </div>
      </form>
    </div>
  );
}
