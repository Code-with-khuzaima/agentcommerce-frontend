import { useState } from "react";

const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || "agentcomerce_admin_2024";

const Icon = ({ path, size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <path d={path} />
  </svg>
);

export default function AdminLoginPage({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!password.trim()) { setError("Enter admin password"); return; }
    setLoading(true);
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        localStorage.setItem("ac_admin_auth", "1");
        onLogin();
      } else {
        setError("Incorrect password");
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&display=swap');`}</style>
      <div className="w-full max-w-xs">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center">
            <Icon path="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" size={17} className="text-white" />
          </div>
          <span className="font-bold text-lg">Admin Panel</span>
        </div>
        <div className="bg-slate-900 border border-white/8 rounded-2xl p-7">
          <h1 className="text-lg font-bold mb-1">AgentComerce Admin</h1>
          <p className="text-sm text-slate-400 mb-5">Enter your admin password to continue</p>
          {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">{error}</div>}
          <div className="relative mb-4">
            <Icon path="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z M7 11V7a5 5 0 0110 0v4"
              size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="Admin password"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-violet-500/60 transition-all" />
          </div>
          <button onClick={handleLogin} disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
            {loading ? "Verifying..." : "Access Admin Dashboard"}
          </button>
        </div>
        <p className="text-xs text-slate-600 text-center mt-4">agentcomrce@gmail.com</p>
      </div>
    </div>
  );
}
