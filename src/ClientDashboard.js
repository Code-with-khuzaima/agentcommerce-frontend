import { useState, useEffect } from "react";
import { apiGetDashboard } from "./api";

const cx = (...a) => a.filter(Boolean).join(" ");

const Icon = ({ path, size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <path d={path} />
  </svg>
);

const icons = {
  bot:     "M12 2a2 2 0 012 2v1h4a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h4V4a2 2 0 012-2z M8 14s1.5 2 4 2 4-2 4-2 M9 10h.01 M15 10h.01",
  copy:    "M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z",
  check:   "M20 6L9 17l-5-5",
  logout:  "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  info:    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 8h.01 M12 12v4",
  msg:     "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  store:   "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  zap:     "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  code:    "M16 18l6-6-6-6 M8 6l-6 6 6 6",
  shopify: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z",
  arrow:   "M5 12h14 M12 5l7 7-7 7",
};

export default function ClientDashboard({ onLogout }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    apiGetDashboard()
      .then(d => { setData(d); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem("ac_token");
    localStorage.removeItem("ac_user");
    onLogout();
  };

  // ── LOADING ───────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading your dashboard...</p>
      </div>
    </div>
  );

  // ── ERROR ─────────────────────────────────────────────────
  if (error) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-red-400 text-sm mb-4">{error}</p>
        <button onClick={handleLogout} className="text-xs text-slate-500 hover:text-white transition-colors">← Back to login</button>
      </div>
    </div>
  );

  const store = data?.store;
  const plan = store?.plan || "starter";
  const msgCount = store?.msgCount || 0;
  const msgLimit = store?.msgLimit || 5000;
  const pct = msgLimit >= 999999 ? 0 : Math.min(Math.round((msgCount / msgLimit) * 100), 100);
  const planLabels = { starter: "$19/mo", pro: "$29/mo", enterprise: "$49/mo" };
  const planColors = {
    starter: "bg-violet-500/15 text-violet-300 border-violet-500/25",
    pro:     "bg-blue-500/15 text-blue-300 border-blue-500/25",
    enterprise: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  };
  const webhookUrl = `https://temp56.app.n8n.cloud/webhook/${plan}-chat`;

  const widgetCode = store?.platform === "shopify"
    ? `<!-- AgentComerce Widget -->
<script>
  window.AgentComerce = {
    store_id:        "${store?.storeId || "store_001"}",
    plan:            "${plan}",
    agent_name:      "${store?.agentName || "Store Assistant"}",
    accent_color:    "${store?.accentColor || "#5B4FE8"}",
    welcome_message: "${store?.welcomeMessage || "Hi! How can I help you today?"}",
    webhook_url:     "${webhookUrl}"
  };
</script>
<script src="https://agentcommerce-frontend-git-master-code-with-khuzaimas-projects.vercel.app/widget.js"></script>`
    : `<!-- AgentComerce Widget -->
<script>
  window.AgentComerce = {
    store_id:        "${store?.storeId || "store_001"}",
    plan:            "${plan}",
    agent_name:      "${store?.agentName || "Store Assistant"}",
    accent_color:    "${store?.accentColor || "#5B4FE8"}",
    welcome_message: "${store?.welcomeMessage || "Hi! How can I help you today?"}",
    webhook_url:     "${webhookUrl}"
  };
</script>
<script src="https://agentcommerce-frontend-git-master-code-with-khuzaimas-projects.vercel.app/widget.js"></script>`;

  const shopifySteps = [
    ["Open theme editor", "Shopify Admin → Online Store → Themes → ⋯ → Edit code"],
    ["Open theme.liquid", "In left sidebar under Layout → click theme.liquid"],
    ["Find </body>", "Press Ctrl+F, search for </body> near the bottom"],
    ["Paste widget code", "Copy code from Widget Code tab, paste BEFORE </body>"],
    ["Save", "Click Save top right → your AI agent is live!"],
  ];

  const wooSteps = [
    ["Install plugin", "WordPress Admin → Plugins → Add New → search 'Insert Headers and Footers' → Install"],
    ["Open plugin settings", "Settings → Insert Headers and Footers"],
    ["Paste in footer", "Copy code from Widget Code tab → paste in Scripts in Footer box"],
    ["Save Changes", "Click Save → visit your store to see the chat button"],
    ["Enable Legacy API", "WooCommerce → Settings → Advanced → Legacy API → Enable → Save"],
  ];

  const steps = store?.platform === "shopify" ? shopifySteps : wooSteps;

  return (
    <div className="min-h-screen bg-slate-950 text-white" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;600;700&display=swap'); * { box-sizing: border-box; }`}</style>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-white/6 bg-slate-950/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <Icon path={icons.bot} size={14} className="text-white" />
          </div>
          <span className="font-bold text-white">AgentComerce</span>
          <span className="text-slate-600 text-sm hidden sm:block">/ Dashboard</span>
          <div className="ml-auto flex items-center gap-3">
            <span className={cx("text-xs font-semibold px-2.5 py-1 rounded-full border", planColors[plan] || planColors.starter)}>
              {plan.charAt(0).toUpperCase() + plan.slice(1)} · {planLabels[plan]}
            </span>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-300 text-xs font-bold">
                {(store?.storeName || "S")[0].toUpperCase()}
              </div>
              <span className="text-xs text-slate-400">{store?.storeName}</span>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-500/10">
              <Icon path={icons.logout} size={13} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* WELCOME */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">
            Welcome back, {store?.storeName} 👋
          </h1>
          <p className="text-slate-400 text-sm">Your AI sales agent is active and ready for customers.</p>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Messages Used", value: msgCount.toLocaleString(), sub: msgLimit >= 999999 ? "Unlimited" : `of ${msgLimit.toLocaleString()}` },
            { label: "Plan", value: plan.charAt(0).toUpperCase() + plan.slice(1), sub: planLabels[plan] },
            { label: "Platform", value: store?.platform === "shopify" ? "Shopify" : "WooCommerce", sub: "Connected" },
            { label: "Store ID", value: store?.storeId || "—", sub: "Your unique ID" },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-slate-900 border border-white/6 rounded-2xl p-4">
              <div className="text-xs text-slate-500 mb-1">{label}</div>
              <div className="text-lg font-bold text-white truncate">{value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
            </div>
          ))}
        </div>

        {/* USAGE BAR */}
        {msgLimit < 999999 && (
          <div className="bg-slate-900 border border-white/6 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white">Message usage this month</span>
              <span className={cx("text-sm font-bold", pct > 80 ? "text-red-400" : pct > 60 ? "text-amber-400" : "text-emerald-400")}>
                {pct}%
              </span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div className={cx("h-full rounded-full transition-all", pct > 80 ? "bg-red-500" : pct > 60 ? "bg-amber-500" : "bg-violet-500")}
                style={{ width: pct + "%" }} />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-slate-500">{msgCount.toLocaleString()} used</span>
              <span className="text-xs text-slate-500">{(msgLimit - msgCount).toLocaleString()} remaining</span>
            </div>
            {pct > 80 && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs">
                <Icon path={icons.info} size={13} />
                Running low on messages. Contact us to upgrade your plan.
              </div>
            )}
          </div>
        )}

        {/* TABS */}
        <div className="flex gap-1 mb-6 bg-slate-900/60 border border-white/6 rounded-xl p-1 w-fit">
          {[["overview", "Overview"], ["install", store?.platform === "shopify" ? "Shopify Setup" : "WooCommerce Setup"], ["widget", "Widget Code"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={cx("px-4 py-2 rounded-lg text-sm font-medium transition-all", tab === key ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white")}>
              {label}
            </button>
          ))}
        </div>

        {/* ── TAB: OVERVIEW ── */}
        {tab === "overview" && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-white/6 rounded-2xl p-6">
              <h2 className="text-base font-bold text-white mb-4">Your agent details</h2>
              <div className="space-y-0">
                {[
                  ["Store Name", store?.storeName || "—"],
                  ["Webhook URL", webhookUrl],
                  ["Store ID", store?.storeId || "—"],
                  ["Agent Name", store?.agentName || "—"],
                  ["Accent Color", store?.accentColor || "#5B4FE8"],
                  ["Status", store?.status || "pending"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <span className="text-sm text-slate-400 shrink-0">{label}</span>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm text-white font-mono truncate max-w-xs text-right">{value}</span>
                      <button onClick={() => copy(value, label)} className="text-slate-600 hover:text-violet-400 transition-colors shrink-0">
                        <Icon path={copied === label ? icons.check : icons.copy} size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {plan !== "enterprise" && (
              <div className="bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20 rounded-2xl p-6 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-white mb-1">Upgrade your plan</h3>
                  <p className="text-sm text-slate-400">
                    {plan === "starter" ? "Get 13,000 messages, persistent memory, and full order tracking with Pro." : "Get unlimited messages and our most powerful AI model with Enterprise."}
                  </p>
                </div>
                <a href="mailto:agentcomrce@gmail.com?subject=Upgrade Request"
                  className="shrink-0 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
                  Upgrade →
                </a>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: INSTALL ── */}
        {tab === "install" && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-white/6 rounded-2xl p-6">
              <h2 className="text-base font-bold text-white mb-1">
                Install on {store?.platform === "shopify" ? "Shopify" : "WooCommerce"}
              </h2>
              <p className="text-sm text-slate-400 mb-6">Follow these steps to add your AI chat widget.</p>
              <div className="space-y-5">
                {steps.map(([title, desc], i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white mb-0.5">{title}</div>
                      <div className="text-xs text-slate-400 leading-relaxed">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-900 border border-white/6 rounded-2xl p-5 flex gap-3">
              <Icon path={icons.info} size={15} className="text-violet-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400 leading-relaxed">
                After installing, visit your store in a new tab. You'll see the chat button in the bottom right corner. Click it to test your AI agent.
              </p>
            </div>
          </div>
        )}

        {/* ── TAB: WIDGET CODE ── */}
        {tab === "widget" && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-white/6 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4 gap-4">
                <div>
                  <h2 className="text-base font-bold text-white mb-0.5">Your widget code</h2>
                  <p className="text-sm text-slate-400">Paste this before the {'</body>'} tag in your theme file</p>
                </div>
                <button onClick={() => copy(widgetCode, "widget")}
                  className={cx("shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    copied === "widget" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-violet-600 hover:bg-violet-500 text-white")}>
                  <Icon path={copied === "widget" ? icons.check : icons.copy} size={14} />
                  {copied === "widget" ? "Copied!" : "Copy code"}
                </button>
              </div>
              <pre className="bg-slate-950 border border-white/5 rounded-xl p-4 text-xs text-slate-300 overflow-x-auto leading-relaxed whitespace-pre-wrap font-mono">
                {widgetCode}
              </pre>
            </div>

            <div className="bg-slate-900 border border-white/6 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white mb-4">Customise your widget</h3>
              <div className="space-y-0">
                {[
                  ["agent_name", "Name shown in the chat header", `"${store?.agentName || "Store Assistant"}"`],
                  ["accent_color", "Color of the chat button and header", `"${store?.accentColor || "#5B4FE8"}"`],
                  ["welcome_message", "First message shown to customers", `"${store?.welcomeMessage || "Hi! How can I help?"}"`],
                ].map(([key, desc, example]) => (
                  <div key={key} className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
                    <code className="text-xs bg-violet-500/15 text-violet-300 px-2 py-0.5 rounded font-mono shrink-0 mt-0.5">{key}</code>
                    <div>
                      <div className="text-xs text-slate-300 mb-0.5">{desc}</div>
                      <div className="text-xs text-slate-500">Current: {example}</div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-4">
                To change any value, email us at <a href="mailto:agentcomrce@gmail.com" className="text-violet-400 hover:text-violet-300">agentcomrce@gmail.com</a> and we'll update it within 24 hours.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
