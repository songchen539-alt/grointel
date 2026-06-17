"use client";

import { useState } from "react";
import { Lock } from "lucide-react";

export default function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.reload();
      } else {
        setError(data.error || "Incorrect password.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        autoFocus
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50 text-center"
      />
      {error && (
        <p className="text-xs text-red-400 text-center">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-medium text-white hover:from-blue-500 hover:to-purple-500 transition-all disabled:opacity-50"
      >
        <Lock className="h-4 w-4" />
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
