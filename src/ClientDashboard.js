import { useEffect, useState } from "react";
import { apiGetDashboard } from "./api";

const cx = (...values) => values.filter(Boolean).join(" ");

function formatLabel(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function StatusBadge({ label, tone = "slate" }) {
  const tones = {
    slate: "border-slate-700 bg-slate-900 text-slate-300",
    violet: "border-violet-500/30 bg-violet-500/10 text-violet-200",
    blue: "border-sky-500/30 bg-sky-500/10 text-sky-200",
    emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  };

  return <span className={cx("inline-flex items-center rounded-xl border px-3 py-1 text-xs font-semibold", tones[tone])}>{label}</span>;
}

function MetricCard({ label, value, hint }) {
  return (
    <div className="rounded-[24px] border border-slate-800 bg-slate-950/80 p-5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</div>
      <div className="mt-3 text-2xl font-black text-white">{value}</div>
      <div className="mt-2 text-sm text-slate-400">{hint}</div>
    </div>
  );
}

function Panel({ title, description, action, children }) {
  return (
    <section className="rounded-[28px] border border-slate-800 bg-slate-950/80 p-5">
      <div className="flex flex-col gap-3 border-b border-slate-800 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function QuickStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#050816] p-4">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</div>
      <div className="mt-2 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

export default function ClientDashboard({ onLogout }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");
  const [copied, setCopied] = useState("");
  const [msgSubject, setMsgSubject] = useState("");
  const [msgBody, setMsgBody] = useState("");
  const [msgSending, setMsgSending] = useState(false);
  const [msgSent, setMsgSent] = useState(false);

  useEffect(() => {
    apiGetDashboard()
      .then((response) => {
        setData(response);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load dashboard.");
        setLoading(false);
      });
  }, []);

  function handleLogout() {
    localStorage.removeItem("ac_token");
    localStorage.removeItem("ac_user");
    onLogout();
  }

  function copy(text, key) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  }

  async function sendMessage() {
    if (!msgSubject.trim() || !msgBody.trim()) return;
    setMsgSending(true);
    try {
      const store = data?.store;
      const mailto = `mailto:agentcomrce@gmail.com?subject=${encodeURIComponent(`[${store?.storeName || "Client"}] ${msgSubject}`)}&body=${encodeURIComponent(`From: ${data?.user?.email}\nStore: ${store?.storeName} (${store?.storeId})\nPlan: ${store?.plan}\n\n${msgBody}`)}`;
      window.open(mailto);
      setMsgSent(true);
      setMsgSubject("");
      setMsgBody("");
      setTimeout(() => setMsgSent(false), 3000);
    } finally {
      setMsgSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050816] text-white">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-violet-500/20 border-t-violet-400" />
          <p className="mt-4 text-sm text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050816] px-4 text-white">
        <div className="rounded-[28px] border border-slate-800 bg-slate-950/80 p-8 text-center">
          <p className="text-sm text-rose-300">{error}</p>
          <button onClick={handleLogout} className="mt-5 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  const store = data?.store || {};
  const plan = store.plan || "starter";
  const msgCount = store.msgCount || 0;
  const msgLimit = store.msgLimit || 5000;
  const usagePercent = msgLimit >= 999999 ? 6 : Math.min(Math.round((msgCount / msgLimit) * 100), 100);
  const usageRemaining = msgLimit >= 999999 ? "Unlimited" : `${Math.max(msgLimit - msgCount, 0).toLocaleString()} remaining`;
  const planLabels = { starter: "$19/mo", pro: "$29/mo", enterprise: "$49/mo" };
  const webhookUrl = `https://temp56.app.n8n.cloud/webhook/${plan}-chat`;

  const widgetCode = `<!-- AgentComerce ${plan.charAt(0).toUpperCase() + plan.slice(1)} Widget -->
<script>
  window.AgentComerce = {
    store_id:        "${store.storeId || "store_001"}",
    plan:            "${plan}",
    agent_name:      "${store.agentName || "Store Assistant"}",
    accent_color:    "${store.accentColor || "#5B4FE8"}",
    welcome_message: "${store.welcomeMessage || "Hi! How can I help you today?"}",
    webhook_url:     "${webhookUrl}"
  };
</script>
<script src="https://agentcommerce-frontend-git-master-code-with-khuzaimas-projects.vercel.app/widget.js"></script>`;

  const installSteps =
    store.platform === "shopify"
      ? [
          ["Open theme editor", "Shopify Admin > Online Store > Themes > Edit code."],
          ["Open theme.liquid", "Find Layout > theme.liquid in the left sidebar."],
          ["Find closing body tag", "Search for </body> near the bottom of the file."],
          ["Paste widget code", "Paste the widget snippet just before </body>."],
          ["Save and test", "Save changes and open your storefront to confirm the widget appears."],
        ]
      : [
          ["Open footer script plugin", "Use Insert Headers and Footers or your preferred code injection plugin."],
          ["Paste widget code", "Add the snippet to the footer scripts area."],
          ["Save changes", "Save the plugin settings."],
          ["Open store", "Visit your WooCommerce store and confirm the widget button appears."],
          ["Enable legacy API if needed", "If your workflow uses it, enable WooCommerce Legacy API under Advanced settings."],
        ];

  const statusTone = (value) => {
    if (["live", "active", "ready"].includes(value)) return "emerald";
    if (["qa_testing", "widget_installing", "workflow_building"].includes(value)) return "amber";
    return "slate";
  };

  const overviewCards = [
    ["Plan", formatLabel(plan), planLabels[plan]],
    ["Messages Used", msgCount.toLocaleString(), usageRemaining],
    ["Platform", formatLabel(store.platform || "unknown"), "Connected store"],
    ["Store ID", store.storeId || "Not set", "Used in widget and workflow"],
  ];

  const statusItems = [
    ["Setup", store.setupStatus || "new"],
    ["Workflow", store.workflowStatus || "not_started"],
    ["Widget", store.widgetStatus || "not_installed"],
  ];

  const tabs = [
    ["overview", "Overview"],
    ["install", store.platform === "shopify" ? "Shopify Setup" : "WooCommerce Setup"],
    ["widget", "Widget Code"],
    ["support", "Support"],
  ];

  const highlights = [
    ["Store Name", store.storeName || "Not set"],
    ["Agent Name", store.agentName || "Store Assistant"],
    ["Accent Color", store.accentColor || "#5B4FE8"],
    ["Welcome Message", store.welcomeMessage || "Not set"],
  ];

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[36px] border border-slate-800 bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.18),_transparent_30%),linear-gradient(180deg,rgba(2,6,23,0.96),rgba(2,6,23,1))] shadow-[0_40px_120px_rgba(2,6,23,0.82)]">
          <header className="border-b border-slate-800 px-5 py-5 sm:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-300">Client Dashboard</div>
                <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">{store.storeName || "Your Store"} dashboard</h1>
                <p className="mt-2 max-w-3xl text-sm text-slate-400">This is the operational view for your live widget, usage, setup progress, and installation details.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge tone="violet" label={`${formatLabel(plan)} · ${planLabels[plan]}`} />
                <StatusBadge tone="blue" label={data?.user?.email || "No email"} />
                <button onClick={handleLogout} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
                  Log Out
                </button>
              </div>
            </div>
          </header>

          <div className="px-5 py-5 sm:px-8">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {overviewCards.map(([label, value, hint]) => (
                <MetricCard key={label} label={label} value={value} hint={hint} />
              ))}
            </div>

            <div className="mt-5 rounded-[28px] border border-slate-800 bg-slate-950/80 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Status overview</h2>
                  <p className="mt-1 text-sm text-slate-400">Track where setup, workflow, and widget installation currently stand.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {statusItems.map(([label, value]) => (
                    <StatusBadge key={label} label={`${label}: ${formatLabel(value)}`} tone={statusTone(value)} />
                  ))}
                </div>
              </div>

              {msgLimit < 999999 ? (
                <div className="mt-5 rounded-[24px] border border-slate-800 bg-[#050816] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">Usage this cycle</span>
                    <span className={cx("text-sm font-bold", usagePercent > 80 ? "text-amber-300" : "text-emerald-300")}>{usagePercent}%</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-800">
                    <div className={cx("h-2 rounded-full", usagePercent > 80 ? "bg-amber-400" : "bg-gradient-to-r from-violet-500 to-sky-400")} style={{ width: `${usagePercent}%` }} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>{msgCount.toLocaleString()} used</span>
                    <span>{usageRemaining}</span>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-5 flex flex-wrap gap-2 rounded-2xl border border-slate-800 bg-slate-950/80 p-2">
              {tabs.map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={cx(
                    "rounded-xl px-4 py-2 text-sm font-semibold transition",
                    tab === key ? "bg-white text-slate-950" : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === "overview" ? (
              <div className="mt-5 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <Panel title="Widget profile" description="Values currently used by your widget on the storefront.">
                  <div className="grid gap-4 md:grid-cols-2">
                    {highlights.map(([label, value]) => (
                      <QuickStat key={label} label={label} value={value} />
                    ))}
                    <QuickStat label="Webhook URL" value={webhookUrl} />
                    <QuickStat label="Store ID" value={store.storeId || "Not set"} />
                  </div>
                </Panel>

                <Panel title="Plan guidance" description="What you can expect from the current plan and what changes after an upgrade.">
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-800 bg-[#050816] p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Current plan</div>
                      <div className="mt-2 text-lg font-bold text-white">{formatLabel(plan)}</div>
                      <div className="mt-1 text-sm text-slate-400">{planLabels[plan]}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-[#050816] p-4 text-sm leading-6 text-slate-300">
                      {plan === "starter"
                        ? "Starter is enough for chat-only support. If you need product cards, richer memory, and more automation control, move to Pro."
                        : plan === "pro"
                          ? "Pro is suitable for most stores. Upgrade to Enterprise only if you actually need deeper reporting and higher-touch operations."
                          : "Enterprise is already the top tier. If something is missing here, it is an implementation issue, not a plan issue."}
                    </div>
                    {plan !== "enterprise" ? (
                      <a href="mailto:agentcomrce@gmail.com?subject=Upgrade Request" className="inline-flex rounded-2xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm font-semibold text-violet-100">
                        Request Upgrade
                      </a>
                    ) : null}
                  </div>
                </Panel>
              </div>
            ) : null}

            {tab === "install" ? (
              <div className="mt-5 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
                <Panel title={`Install on ${formatLabel(store.platform || "store")}`} description="Use these steps exactly. If your widget does not show after this, the issue is in the install placement or workflow URL.">
                  <div className="space-y-4">
                    {installSteps.map(([title, description], index) => (
                      <div key={title} className="flex gap-4 rounded-2xl border border-slate-800 bg-[#050816] p-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-violet-500/30 bg-violet-500/10 text-sm font-bold text-violet-200">
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">{title}</div>
                          <div className="mt-1 text-sm text-slate-400">{description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel title="Operational details" description="Keep these values for support or troubleshooting.">
                  <div className="grid gap-4">
                    <QuickStat label="Platform" value={formatLabel(store.platform || "unknown")} />
                    <QuickStat label="Store URL" value={store.storeUrl || "Not set"} />
                    <QuickStat label="Workflow Status" value={formatLabel(store.workflowStatus || "not_started")} />
                    <QuickStat label="Widget Status" value={formatLabel(store.widgetStatus || "not_installed")} />
                  </div>
                </Panel>
              </div>
            ) : null}

            {tab === "widget" ? (
              <div className="mt-5 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <Panel
                  title="Widget code"
                  description="Paste this snippet before the closing body tag or into your footer script injection area."
                  action={
                    <button
                      onClick={() => copy(widgetCode, "widget")}
                      className={cx("rounded-2xl px-4 py-3 text-sm font-semibold", copied === "widget" ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "bg-white text-slate-950")}
                    >
                      {copied === "widget" ? "Copied" : "Copy Code"}
                    </button>
                  }
                >
                  <pre className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#050816] p-4 text-xs leading-6 text-slate-300">{widgetCode}</pre>
                </Panel>

                <Panel title="Config reference" description="These are the values currently embedded in the snippet.">
                  <div className="grid gap-4">
                    <QuickStat label="Agent Name" value={store.agentName || "Store Assistant"} />
                    <QuickStat label="Accent Color" value={store.accentColor || "#5B4FE8"} />
                    <QuickStat label="Welcome Message" value={store.welcomeMessage || "Not set"} />
                    <QuickStat label="Webhook URL" value={webhookUrl} />
                  </div>
                </Panel>
              </div>
            ) : null}

            {tab === "support" ? (
              <div className="mt-5 grid gap-6 xl:grid-cols-[1fr_0.85fr]">
                <Panel title="Send support message" description="This opens your mail client with the correct store context attached.">
                  {msgSent ? <div className="mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">Message prepared. Send it from your email client.</div> : null}
                  <div className="space-y-4">
                    <label className="block">
                      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Subject</div>
                      <input value={msgSubject} onChange={(event) => setMsgSubject(event.target.value)} className="w-full rounded-2xl border border-slate-800 bg-[#050816] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600" placeholder="Widget issue, plan change, branding update..." />
                    </label>
                    <label className="block">
                      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Message</div>
                      <textarea value={msgBody} onChange={(event) => setMsgBody(event.target.value)} rows={6} className="w-full rounded-2xl border border-slate-800 bg-[#050816] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600" placeholder="Describe the issue or request clearly." />
                    </label>
                    <button onClick={sendMessage} disabled={msgSending || !msgSubject.trim() || !msgBody.trim()} className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 disabled:opacity-50">
                      {msgSending ? "Opening..." : "Send Message"}
                    </button>
                  </div>
                </Panel>

                <Panel title="Support details" description="Use these references when you contact support.">
                  <div className="grid gap-4">
                    <QuickStat label="Support Email" value="agentcomrce@gmail.com" />
                    <QuickStat label="Store Name" value={store.storeName || "Not set"} />
                    <QuickStat label="Store ID" value={store.storeId || "Not set"} />
                    <QuickStat label="Plan" value={`${formatLabel(plan)} · ${planLabels[plan]}`} />
                  </div>
                </Panel>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
