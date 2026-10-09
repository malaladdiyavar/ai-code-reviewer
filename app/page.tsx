
"use client";

import { useState } from "react";

export default function Home() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("Python");
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function reviewCode() {
    setError("");
    setReview("");

    if (!code.trim()) {
      setError("Please paste some code before starting the review.");
      return;
    }

    if (code.length > 12000) {
      setError("Your code is too long. Please keep it under 12,000 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Review failed. Please try again.");
      }

      if (!response.body) {
        throw new Error("No response received from the server.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setReview((previous) => previous + decoder.decode(value, { stream: true }));
      }

      const remaining = decoder.decode();
      if (remaining) setReview((previous) => previous + remaining);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 px-6 py-5">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="rounded-xl bg-indigo-500 p-2 text-xl">{"</>"}</div>
          <div>
            <h1 className="text-xl font-bold">CodeLens AI</h1>
            <p className="text-sm text-slate-400">Your intelligent code reviewer</p>
          </div>
          <span className="ml-auto rounded-full border border-emerald-700 px-3 py-1 text-xs text-emerald-400">
            AI REVIEW
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-400">
            Write better code
          </p>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Find bugs before they find you.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Submit your code for an AI-powered review of potential bugs,
            security issues, performance, and readability.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-semibold">Your code</h3>
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm outline-none focus:border-indigo-500"
              >
                {["Python", "JavaScript", "TypeScript", "Java", "C++", "C", "Go", "PHP", "Other"].map(
                  (item) => (
                    <option key={item}>{item}</option>
                  )
                )}
              </select>
            </div>

            <textarea
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder={"# Paste your code here...\n\ndef example():\n    pass"}
              spellCheck={false}
              className="h-80 w-full resize-y rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-200 outline-none placeholder:text-slate-600 focus:border-indigo-500"
            />

            <div className="mt-3 flex justify-between text-xs text-slate-500">
              <span>Maximum 12,000 characters</span>
              <span>{code.length.toLocaleString()} / 12,000</span>
            </div>

            <button
              onClick={reviewCode}
              disabled={loading}
              className="mt-5 w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Analyzing your code..." : "✦ Review my code"}
            </button>

            {error && (
              <p role="alert" className="mt-4 rounded-lg border border-red-800 bg-red-950/50 p-3 text-sm text-red-300">
                {error}
              </p>
            )}
          </section>

          <section className="min-h-[420px] rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-5 flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="rounded-lg bg-indigo-500/15 p-2">✦</div>
              <div>
                <h3 className="font-semibold">Review results</h3>
                <p className="text-xs text-slate-400">AI-powered code analysis</p>
              </div>
              {loading && (
                <span className="ml-auto animate-pulse text-xs text-indigo-400">
                  Generating...
                </span>
              )}
            </div>

            {!review && !loading && (
              <div className="flex min-h-72 flex-col items-center justify-center text-center">
                <div className="mb-4 text-4xl text-slate-600">⌘</div>
                <p className="font-medium text-slate-300">Ready to review</p>
                <p className="mt-2 max-w-xs text-sm text-slate-500">
                  Your code review will appear here, including suggested fixes
                  and improvements.
                </p>
              </div>
            )}

            {loading && !review && (
              <p className="animate-pulse text-sm text-indigo-300">
                Connecting to the AI reviewer...
              </p>
            )}

            {review && (
              <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-slate-300">
                {review}
              </pre>
            )}

            {error && !review && !loading && (
              <p className="mt-4 text-sm text-slate-500">
                Fix the issue above and try again.
              </p>
            )}
          </section>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            ["🐛", "Bug detection", "Find potential logic errors"],
            ["🛡️", "Security checks", "Identify possible vulnerabilities"],
            ["⚡", "Code quality", "Improve readability and performance"],
          ].map(([icon, title, description]) => (
            <div key={title} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <span className="text-xl">{icon}</span>
              <h3 className="mt-2 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-slate-400">{description}</p>
            </div>
          ))}
        </div>

        <footer className="mt-12 text-center text-xs text-slate-500">
          CodeLens AI · Built with Next.js and Gemini
        </footer>
      </section>
    </main>
  );
}
