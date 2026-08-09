"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email,
          password,
        }),
      });

      alert("Login Attempt Logged");
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login request failed");
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-sky-200 via-sky-100 to-white">
      {/* Soft background glow */}
      <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-white/40 blur-3xl" />
      <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-white/50 blur-3xl" />

      {/* Cloud shapes */}
      <div className="absolute bottom-[-120px] left-[-100px] h-72 w-[650px] rounded-full bg-white/80 blur-2xl" />
      <div className="absolute bottom-[-100px] right-[-120px] h-80 w-[700px] rounded-full bg-white/90 blur-2xl" />
      <div className="absolute bottom-20 left-1/2 h-48 w-[500px] -translate-x-1/2 rounded-full bg-white/60 blur-3xl" />

      {/* Decorative curved lines */}
      <div className="pointer-events-none absolute bottom-[-250px] left-1/2 h-[550px] w-[1100px] -translate-x-1/2 rounded-[50%] border border-white/70" />
      <div className="pointer-events-none absolute bottom-[-300px] left-1/2 h-[650px] w-[1300px] -translate-x-1/2 rounded-[50%] border border-white/50" />

      {/* Brand */}
      <div className="absolute left-8 top-7 z-10 flex items-center gap-3 sm:left-12 sm:top-8">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#17181d] shadow-lg">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 3a7 7 0 0 0-7 7v4a4 4 0 0 0 4 4h1v-5H8a4 4 0 1 1 8 0h-2v5h1a4 4 0 0 0 4-4v-4a7 7 0 0 0-7-7Z" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        </div>

        <span className="text-xl font-bold tracking-tight text-[#111318]">
          EdgeSOC
        </span>
      </div>

      {/* Login card */}
      <section className="relative z-10 flex min-h-screen items-center justify-center px-5 py-24">
        <div className="w-full max-w-[500px] rounded-[30px] border border-white/70 bg-white/55 px-7 py-9 shadow-[0_25px_80px_rgba(60,120,160,0.18)] backdrop-blur-xl sm:px-11 sm:py-11">
          
          {/* Login icon */}
          <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-[18px] border border-white/80 bg-white/75 shadow-[0_8px_25px_rgba(0,0,0,0.08)]">
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8 text-[#17191e]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 17l5-5-5-5" />
              <path d="M15 12H3" />
              <path d="M21 3v18" />
            </svg>
          </div>

          {/* Heading */}
          <div className="mb-7 text-center">
            <h1 className="text-[28px] font-semibold tracking-tight text-[#101217] sm:text-[30px]">
              Sign in with email
            </h1>

            <p className="mx-auto mt-3 max-w-[340px] text-sm leading-5 text-[#6c737d]">
              Access your EdgeSOC security dashboard and monitor your
              infrastructure in real time.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            
            {/* Email */}
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#68717d]">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </div>

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 w-full rounded-xl border border-white/70 bg-[#eef2f5]/90 pl-12 pr-4 text-sm text-[#17191e] outline-none transition placeholder:text-[#7b838d] focus:border-[#6d98b7] focus:bg-white"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#68717d]">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="4" y="10" width="16" height="10" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
              </div>

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-14 w-full rounded-xl border border-white/70 bg-[#eef2f5]/90 pl-12 pr-4 text-sm text-[#17191e] outline-none transition placeholder:text-[#7b838d] focus:border-[#6d98b7] focus:bg-white"
              />
            </div>

            {/* Forgot password */}
            <div className="flex justify-end px-1 pt-1">
              <button
                type="button"
                onClick={() => alert("Password recovery is not configured yet.")}
                className="text-sm font-medium text-[#20242a] transition hover:text-[#4d7898]"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="mt-2 h-14 w-full rounded-xl bg-gradient-to-b from-[#303138] to-[#15161b] text-sm font-semibold text-white shadow-lg transition hover:from-[#3a3b43] hover:to-[#1b1c21] active:scale-[0.99]"
            >
              Get Started
            </button>
          </form>

          {/* Divider */}
          <div className="my-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/80" />

            <span className="text-xs font-medium text-[#7a818a]">
              Or sign in with
            </span>

            <div className="h-px flex-1 bg-white/80" />
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => alert("Google login is not configured yet.")}
              className="flex h-12 items-center justify-center rounded-xl border border-white/80 bg-white/65 text-[#4285F4] shadow-sm transition hover:bg-white"
            >
              <span className="text-lg font-bold">G</span>
            </button>

            <button
              type="button"
              onClick={() => alert("Facebook login is not configured yet.")}
              className="flex h-12 items-center justify-center rounded-xl border border-white/80 bg-white/65 text-[#1877F2] shadow-sm transition hover:bg-white"
            >
              <span className="text-lg font-bold">f</span>
            </button>

            <button
              type="button"
              onClick={() => alert("Apple login is not configured yet.")}
              className="flex h-12 items-center justify-center rounded-xl border border-white/80 bg-white/65 text-black shadow-sm transition hover:bg-white"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="currentColor"
              >
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.39 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.32 2.99-2.52 4.09ZM12.03 7.25C11.88 5.02 13.69 3.18 15.78 3c.29 2.58-2.34 4.5-3.75 4.25Z" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}