"use client";

import { useState } from "react";
import { Send, Check } from "lucide-react";

interface LeadFormProps {
  reportId: string;
  companyName: string;
}

export default function LeadForm({ reportId, companyName }: LeadFormProps) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const role = (form.elements.namedItem("role") as HTMLInputElement).value;

    if (!email || !email.includes("@")) return;

    try {
      const res = await fetch("/api/report-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, companyName, workEmail: email, role }),
      });
      const data = await res.json();

      if (res.status === 409) {
        setErrorMsg(data.error || "Already submitted.");
        setState("error");
        return;
      }

      if (data.success) {
        setState("success");
      } else {
        setErrorMsg(data.error || "Something went wrong.");
        setState("error");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Check className="h-5 w-5 text-emerald-400" />
          <p className="text-sm font-medium text-emerald-300">Request received</p>
        </div>
        <p className="text-xs text-gray-500">Our team will contact you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="email"
        name="email"
        placeholder="Work email"
        required
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          name="name"
          placeholder="Company name"
          required
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50"
        />
        <input
          type="text"
          name="role"
          placeholder="Your role"
          required
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50"
        />
      </div>
      {errorMsg && (
        <p className="text-xs text-red-400">{errorMsg}</p>
      )}
      <button
        type="submit"
        disabled={state === "loading"}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-medium text-white hover:from-blue-500 hover:to-purple-500 transition-all disabled:opacity-50"
      >
        {state === "loading" ? (
          <>Submitting...</>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Request Full Report
          </>
        )}
      </button>
    </form>
  );
}
