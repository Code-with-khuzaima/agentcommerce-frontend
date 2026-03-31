// LoginPage.js
import React, { useState } from "react";
import { apiLogin } from "./api";

const EMAILJS_SERVICE_ID = "service_26d0u9m";
const EMAILJS_PUBLIC_KEY = "Nvak4g2MT8AuvKpb6";
const EMAILJS_FORGOT_TEMPLATE_ID = "template_3s3hffj";
const Icon = ({ path, size = 20, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d={path} />
  </svg>
);

const icons = {
  bot: "M12 2a2 2 0 012 2v1h4a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h4V4a2 2 0 012-2z M8 14s1.5 2 4 2 4-2 4-2 M9 10h.01 M15 10h.01",
  mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
  lock: "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z M7 11V7a5 5 0 0110 0v4",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z",
  eyeOff: "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24 M1 1l22 22",
  info: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 8h.01 M12 12v4",
  arrow: "M5 12h14 M12 5l7 7-7 7",
  arrowL: "M19 12H5 M12 19l-7-7 7-7",
};

export default function LoginPage({ onLogin, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("I forgot my password. Please help me recover my dashboard access.");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotNotice, setForgotNotice] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password");
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");

    try {
      const res = await apiLogin(email.trim().toLowerCase(), password);

      // Save token and user info
      localStorage.setItem("ac_token", res.token);
      localStorage.setItem("ac_user", JSON.stringify(res.user));

      // Call onLogin callback
      if (onLogin) onLogin(res.user);
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) {
      setForgotError("Enter your email address.");
      return;
    }

    if (!forgotMessage.trim()) {
      setForgotError("Enter your message.");
      return;
    }

    setForgotLoading(true);
    setForgotError("");
    setForgotNotice("");

    try {
      await window.emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_FORGOT_TEMPLATE_ID,
        {
          title: "Forgot Password Request",
          subject: "Forgot Password Request",
          from_name: "Dashboard User",
          from_email: forgotEmail.trim().toLowerCase(),
          reply_to: forgotEmail.trim().toLowerCase(),
          message: forgotMessage.trim(),
        },
        EMAILJS_PUBLIC_KEY
      );
      setForgotNotice("Your forgot password request has been sent. Check your email after our team reviews it.");
    } catch (err) {
      setForgotError("Failed to send request. Please email us directly at agentcomrce@gmail.com");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;600;700&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center">
            <Icon path={icons.bot} size={18} className="text-white" />
          </div>
          <span className="font-bold text-white text-xl tracking-tight">AgentComerce</span>
        </div>

        <div className="bg-slate-900 border border-white/8 rounded-2xl p-8">
          <button
            onClick={onBack}
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
          >
            <Icon path={icons.arrowL} size={15} />
            Back to Home
          </button>

          <h1 className="text-xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-sm text-slate-400 mb-6">Sign in to your dashboard</p>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-5">
              <Icon path={icons.info} size={14} className="shrink-0" />
              {error}
            </div>
          )}

          {notice && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm mb-5">
              <Icon path={icons.info} size={14} className="shrink-0" />
              {notice}
            </div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1.5 block">Email address</label>
              <div className="relative">
                <Icon path={icons.mail} size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  placeholder="you@store.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/40 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <Icon path={icons.lock} size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/40 transition-all"
                />
                <button onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  <Icon path={showPass ? icons.eyeOff : icons.eye} size={15} />
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2">
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Icon path={icons.arrow} size={15} />}
              {loading ? "Signing in..." : "Sign in to Dashboard"}
            </button>

            <button
              onClick={() => {
                setForgotOpen(true);
                setForgotEmail(email || "");
                setForgotMessage("I forgot my password. Please help me recover my dashboard access.");
                setForgotError("");
                setForgotNotice("");
              }}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-slate-300 transition-colors hover:border-violet-500/30 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Forgot Password?
            </button>
          </div>

          <p className="text-xs text-slate-500 text-center mt-6">
            Don't have an account?{" "}
            <button onClick={onBack} className="text-violet-400 hover:text-violet-300 transition-colors">
              Sign up now →
            </button>
          </p>
        </div>

        <p className="text-xs text-slate-600 text-center mt-4">
          Need help?{" "}
          <a href="mailto:agentcomrce@gmail.com" className="text-slate-500 hover:text-slate-300 transition-colors">
            agentcomrce@gmail.com
          </a>
        </p>
      </div>

      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Forgot Password</h2>
                <p className="mt-1 text-sm text-slate-400">Send us your dashboard email and message. We receive the request and follow up by email.</p>
              </div>
              <button
                onClick={() => {
                  setForgotOpen(false);
                  setForgotLoading(false);
                  setForgotError("");
                  setForgotNotice("");
                }}
                className="text-sm font-medium text-slate-500 transition-colors hover:text-white"
              >
                Close
              </button>
            </div>

            {forgotError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                <Icon path={icons.info} size={14} className="shrink-0" />
                {forgotError}
              </div>
            )}

            {forgotNotice && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                <Icon path={icons.info} size={14} className="shrink-0" />
                {forgotNotice}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Email address</label>
              <div className="relative">
                <Icon path={icons.mail} size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleForgotPassword()}
                  placeholder="you@store.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/60"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Message</label>
              <textarea
                rows={4}
                value={forgotMessage}
                onChange={e => setForgotMessage(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/60"
              />
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => {
                  setForgotOpen(false);
                  setForgotLoading(false);
                  setForgotError("");
                  setForgotNotice("");
                }}
                className="rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:border-white/20 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleForgotPassword}
                disabled={forgotLoading}
                className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {forgotLoading ? "Sending..." : "Send Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
