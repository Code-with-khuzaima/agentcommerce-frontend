import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPatch, apiPost, clearAdminSession } from "./api";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const number = new Intl.NumberFormat("en-US");

const statusOptions = ["pending", "review", "active", "paused", "archived"];
const planOptions = ["starter", "pro", "enterprise"];
const paymentOptions = ["pending", "paid", "overdue", "refunded"];
const setupOptions = ["new", "credentials_review", "workflow_building", "widget_installing", "qa_testing", "live"];
const workflowOptions = ["not_started", "draft", "ready", "live", "issue"];
const widgetOptions = ["not_installed", "ready", "live", "paused"];
const priorityOptions = ["low", "medium", "high", "urgent"];

const cx = (...values) => values.filter(Boolean).join(" ");

function formatLabel(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : date.toLocaleString();
}

function toneForStatus(value) {
  if (["active", "live", "paid", "ready"].includes(value)) return "emerald";
  if (["urgent", "overdue", "issue", "paused"].includes(value)) return "rose";
  if (["review", "workflow_building", "widget_installing", "credentials_review", "draft"].includes(value)) return "amber";
  return "slate";
}

function Badge({ children, tone = "slate" }) {
  const tones = {
    slate: "border-slate-700 bg-slate-900 text-slate-300",
    violet: "border-violet-500/30 bg-violet-500/10 text-violet-200",
    emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    rose: "border-rose-500/30 bg-rose-500/10 text-rose-200",
    blue: "border-sky-500/30 bg-sky-500/10 text-sky-200",
  };

  return <span className={cx("inline-flex items-center rounded-xl border px-3 py-1 text-xs font-semibold", tones[tone])}>{children}</span>;
}

function SummaryCard({ label, value, hint }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</div>
      <div className="mt-3 text-3xl font-black text-white">{value}</div>
      <div className="mt-2 text-sm text-slate-400">{hint}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <Field label={label}>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-500/50">
        {options.map((option) => (
          <option key={option} value={option}>
            {formatLabel(option)}
          </option>
        ))}
      </select>
    </Field>
  );
}

function InputField({ label, value, onChange, placeholder = "", type = "text" }) {
  return (
    <Field label={label}>
      <input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(type === "number" ? Number(event.target.value) : event.target.value)} className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-violet-500/50" />
    </Field>
  );
}

function TextareaField({ label, value, onChange, placeholder = "", rows = 4 }) {
  return (
    <Field label={label}>
      <textarea rows={rows} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-violet-500/50" />
    </Field>
  );
}

function SectionCard({ title, description, action, children }) {
  return (
    <section className="rounded-[28px] border border-slate-800 bg-slate-950/70 p-5">
      <div className="flex flex-col gap-3 border-b border-slate-800 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
          {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function workflowTemplateFor(store) {
  if (!store) return null;
  const key = `${store.plan || "starter"}:${store.platform || "shopify"}`;
  const map = {
    "starter:shopify": {
      label: "Starter Shopify",
      file: "D:\\Desktop\\agentcomerce_master\\starter\\shopify\\starter_shopify_backend_final.json",
      path: "starter-chat",
    },
    "starter:woocommerce": {
      label: "Starter WooCommerce",
      file: "D:\\Desktop\\agentcomerce_master\\starter\\woocommerce\\starter_woocommerce_backend_final.json",
      path: "starter-chat",
    },
    "pro:shopify": {
      label: "Pro Shopify",
      file: "D:\\Desktop\\pro_plan\\shopify\\pro_shopify_workflow.json",
      path: "pro-chat",
    },
    "pro:woocommerce": {
      label: "Pro WooCommerce",
      file: "D:\\Desktop\\pro_plan\\woocommerce\\AgentComerce — Pro Plan — WooCommerce.json",
      path: "pro-chat",
    },
    "enterprise:shopify": {
      label: "Enterprise Shopify",
      file: "D:\\Desktop\\enterprise_plan\\shopify\\enterprise_shopify_workflow.json",
      path: "enterprise-chat",
    },
    "enterprise:woocommerce": {
      label: "Enterprise WooCommerce",
      file: "D:\\Desktop\\enterprise_plan\\woocommerce\\AgentComerce — Enterprise Plan — WooCommerce.json",
      path: "enterprise-chat",
    },
  };
  return map[key] || null;
}

function planCapabilityFor(plan) {
  const capabilities = {
    starter: "5,000 message limit with basic sales chat.",
    pro: "13,000 message limit with memory and richer recommendations.",
    enterprise: "High-volume usage, memory, and advanced workflow handling.",
  };
  return capabilities[plan] || capabilities.starter;
}

function ChecklistItem({ done, label, detail }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#050816] p-4">
      <div className="flex items-center gap-3">
        <div className={cx("flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black", done ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-300")}>
          {done ? "OK" : "TODO"}
        </div>
        <div>
          <div className="text-sm font-semibold text-white">{label}</div>
          {detail ? <div className="mt-1 text-xs text-slate-400">{detail}</div> : null}
        </div>
      </div>
    </div>
  );
}

function mapForm(store) {
  return {
    status: store.status,
    plan: store.plan,
    paymentStatus: store.paymentStatus,
    setupStatus: store.setupStatus,
    workflowStatus: store.workflowStatus,
    widgetStatus: store.widgetStatus,
    priority: store.priority,
    msgCount: store.msgCount,
    msgLimit: store.msgLimit,
    paymentAmount: store.paymentAmount,
    webhookUrl: store.webhookUrl || "",
    agentName: store.agentName || "",
    accentColor: store.accentColor || "#7c3aed",
    welcomeMessage: store.welcomeMessage || "",
    internalNotes: store.internalNotes || "",
  };
}

export default function AdminDashboard() {
  const [filters, setFilters] = useState({ search: "", status: "all", plan: "all", platform: "all" });
  const [summary, setSummary] = useState(null);
  const [stores, setStores] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [logMessage, setLogMessage] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [accountLookup, setAccountLookup] = useState(null);
  const [accountLoading, setAccountLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const [installGuideEmail, setInstallGuideEmail] = useState("");
  const [installGuideText, setInstallGuideText] = useState("");
  
  function jumpToSection(id) {
    const node = document.getElementById(id);
    if (node) node.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleLogout() {
    clearAdminSession();
    localStorage.removeItem("ac_admin_auth");
    window.location.replace("/admin");
  }

  async function openStore(id) {
    setSelectedId(id);
    setError("");
    setTempPassword("");
    try {
      const detail = await apiGet(`/admin/stores/${id}`);
      setSelectedStore(detail.store);
      setForm(mapForm(detail.store));
      setAccountEmail(detail.store?.loginEmail || "");
      setInstallGuideEmail(detail.store?.contactEmail || detail.store?.loginEmail || "");
      setInstallGuideText(detail.store?.installGuide || detail.store?.defaultInstallGuide || "");
      setAccountLookup(null);
    } catch (err) {
      setError(err.message || "Failed to load store.");
    }
  }

  async function loadDashboard(nextFilters = filters, preferredId = selectedId) {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      Object.entries(nextFilters).forEach(([key, value]) => {
        if (value && value !== "all") params.set(key, value);
      });
      const data = await apiGet(`/admin/dashboard${params.toString() ? `?${params.toString()}` : ""}`);
      setSummary(data.summary);
      setStores(data.stores);
      const nextId = preferredId && data.stores.some((store) => store.id === preferredId) ? preferredId : data.stores[0]?.id || null;
      if (nextId) {
        await openStore(nextId);
      } else {
        setSelectedId(null);
        setSelectedStore(null);
        setForm(null);
      }
    } catch (err) {
      setError(err.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard(filters, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedId) return undefined;

    const interval = window.setInterval(async () => {
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value && value !== "all") params.set(key, value);
        });
        const [dashboard, detail] = await Promise.all([
          apiGet(`/admin/dashboard${params.toString() ? `?${params.toString()}` : ""}`),
          apiGet(`/admin/stores/${selectedId}`),
        ]);
        setSummary(dashboard.summary);
        setStores(dashboard.stores);
        setSelectedStore(detail.store);
      } catch {
        // keep current state if background refresh fails
      }
    }, 15000);

    return () => window.clearInterval(interval);
  }, [filters, selectedId]);

  async function saveStore() {
    if (!selectedId || !form) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await apiPatch(`/admin/stores/${selectedId}`, form);
      await loadDashboard(filters, selectedId);
      setSuccess("Store updated.");
    } catch (err) {
      setError(err.message || "Failed to save store.");
    } finally {
      setSaving(false);
    }
  }

  async function applyStorePatch(patch, message) {
    if (!selectedId) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await apiPatch(`/admin/stores/${selectedId}`, patch);
      await loadDashboard(filters, selectedId);
      setSuccess(message);
    } catch (err) {
      setError(err.message || "Failed to update store.");
    } finally {
      setSaving(false);
    }
  }

  async function addLog(event) {
    if (!selectedId) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await apiPost(`/admin/stores/${selectedId}/logs`, { event, payload: { note: logMessage || formatLabel(event) } });
      setLogMessage("");
      await openStore(selectedId);
      setSuccess("Activity logged.");
    } catch (err) {
      setError(err.message || "Failed to log activity.");
    } finally {
      setSaving(false);
    }
  }

  async function lookupClientAccount() {
    if (!accountEmail.trim()) {
      setError("Enter an email to check the client account.");
      return;
    }

    setAccountLoading(true);
    setError("");
    setSuccess("");
    setTempPassword("");
    try {
      const result = await apiGet(`/admin/client-user?email=${encodeURIComponent(accountEmail.trim().toLowerCase())}`);
      setAccountLookup(result);
      if (!result.exists) {
        setSuccess("No client account found for that email.");
      }
    } catch (err) {
      setError(err.message || "Failed to look up client account.");
    } finally {
      setAccountLoading(false);
    }
  }

  async function resetClientPassword() {
    if (!accountEmail.trim()) {
      setError("Enter an email first.");
      return;
    }

    setAccountLoading(true);
    setError("");
    setSuccess("");
    setTempPassword("");
    try {
      const result = await apiPost("/admin/client-user/reset-password", {
        email: accountEmail.trim().toLowerCase(),
      });
      setTempPassword(result.temporaryPassword || "");
      setSuccess("Temporary password generated.");
      await lookupClientAccount();
    } catch (err) {
      setError(err.message || "Failed to reset client password.");
    } finally {
      setAccountLoading(false);
    }
  }

  async function sendInstallGuide() {
    if (!selectedId) return;
    if (!installGuideEmail.trim()) {
      setError("Enter the client email for the install guide.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const result = await apiPost(`/admin/stores/${selectedId}/send-install-guide`, {
        email: installGuideEmail.trim().toLowerCase(),
        installGuide: installGuideText.trim(),
      });
      await loadDashboard(filters, selectedId);
      setSuccess(result.message || "Install guide sent.");
    } catch (err) {
      setError(err.message || "Failed to send install guide.");
    } finally {
      setSaving(false);
    }
  }

  const cards = useMemo(() => {
    if (!summary) return [];
    return [
      ["Active Stores", number.format(summary.activeStores), `${summary.widgetLive} widgets live`],
      ["Pending Review", number.format(summary.pendingStores), `${summary.setupQueue} stores in setup queue`],
      ["Collected Revenue", money.format(summary.collectedRevenue), `${money.format(summary.unpaidRevenue)} still unpaid`],
      ["Messages Used", number.format(summary.totalMessagesUsed), `${number.format(summary.totalUsageLeft)} remaining`],
    ];
  }, [summary]);
  const workflowTemplate = selectedStore ? workflowTemplateFor(selectedStore) : null;
  const planCapability = selectedStore ? planCapabilityFor(selectedStore.plan) : "";
  const adminChecklist = selectedStore
    ? [
        {
          done: Boolean(selectedStore.credentialsPresent),
          label: "Credentials saved",
          detail: selectedStore.credentialsPresent ? "Encrypted credentials are present in backend storage." : "Credentials are missing for this store.",
        },
        {
          done: Boolean(form?.webhookUrl),
          label: "Webhook saved",
          detail: form?.webhookUrl ? "Workflow routing is saved on the store record." : "Save the live n8n webhook URL before testing.",
        },
        {
          done: ["ready", "live"].includes(selectedStore.workflowStatus),
          label: "Workflow prepared",
          detail: `Current workflow status: ${formatLabel(selectedStore.workflowStatus || "not_started")}`,
        },
        {
          done: Boolean(selectedStore.installGuideSentAt),
          label: "Install guide sent",
          detail: selectedStore.installGuideSentAt ? `Last sent on ${formatDate(selectedStore.installGuideSentAt)}` : "Send the install guide after you complete QA.",
        },
      ]
    : [];

  const navItems = [
    ["admin-overview", "Overview"],
    ["admin-queue", "Store Queue"],
    ["admin-settings", "Store Settings"],
    ["admin-workflow", "Workflow"],
    ["admin-client-access", "Client Access"],
    ["admin-activity", "Activity"],
  ];

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-[1720px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[36px] border border-slate-800 bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.18),_transparent_30%),linear-gradient(180deg,rgba(2,6,23,0.96),rgba(2,6,23,1))] shadow-[0_40px_120px_rgba(2,6,23,0.82)]">
          <div className="border-b border-slate-800 px-5 py-5 sm:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-300">Admin Dashboard</div>
                <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">Operations and store delivery</h1>
                <p className="mt-2 max-w-3xl text-sm text-slate-400">This dashboard is for internal review, workflow setup, QA, and client handoff.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => loadDashboard(filters, selectedId)} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:border-slate-600">Refresh</button>
                <button onClick={() => addLog("manual_follow_up")} disabled={!selectedId || saving} className="rounded-2xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm font-semibold text-violet-100 transition disabled:opacity-50">Log Follow-Up</button>
                <button onClick={handleLogout} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:border-slate-600">Log Out</button>
              </div>
            </div>
            {error ? <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div> : null}
            {success ? <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{success}</div> : null}
          </div>

          <div className="px-5 py-5 sm:px-8">
            <div id="admin-overview" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 scroll-mt-24">
              {cards.map(([label, value, hint]) => (
                <SummaryCard key={label} label={label} value={value} hint={hint} />
              ))}
            </div>

            <div id="admin-queue" className="mt-5 grid gap-4 rounded-[28px] border border-slate-800 bg-slate-950/70 p-5 xl:grid-cols-[2.1fr_1fr_1fr_1fr_auto] scroll-mt-24">
              <InputField label="Search" value={filters.search} onChange={(value) => setFilters((current) => ({ ...current, search: value }))} placeholder="Store, email, URL, ID" />
              <SelectField label="Status" value={filters.status} onChange={(value) => setFilters((current) => ({ ...current, status: value }))} options={["all", ...statusOptions]} />
              <SelectField label="Plan" value={filters.plan} onChange={(value) => setFilters((current) => ({ ...current, plan: value }))} options={["all", ...planOptions]} />
              <SelectField label="Platform" value={filters.platform} onChange={(value) => setFilters((current) => ({ ...current, platform: value }))} options={["all", "shopify", "woocommerce"]} />
              <div className="flex items-end gap-3">
                <button onClick={() => loadDashboard(filters, selectedId)} className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950">Apply</button>
                <button
                  onClick={() => {
                    const reset = { search: "", status: "all", plan: "all", platform: "all" };
                    setFilters(reset);
                    loadDashboard(reset, null);
                  }}
                  className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-6 2xl:grid-cols-[380px_220px_minmax(0,1fr)]">
              <aside className="rounded-[30px] border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">Store Queue</h2>
                    <p className="mt-1 text-sm text-slate-400">Submission inbox, payment state, launch progress.</p>
                  </div>
                  <Badge tone="blue">{stores.length} stores</Badge>
                </div>
                <div className="mt-4 space-y-3">
                  {loading ? <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-5 text-sm text-slate-400">Loading stores...</div> : null}
                  {!loading && stores.length === 0 ? <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-5 text-sm text-slate-400">No stores match the active filters.</div> : null}
                  {!loading &&
                    stores.map((store) => {
                      const usageWidth = store.msgLimit ? Math.min((store.msgCount / store.msgLimit) * 100, 100) : 0;
                      return (
                        <button key={store.id} onClick={() => openStore(store.id)} className={cx("w-full rounded-[24px] border p-4 text-left transition", selectedId === store.id ? "border-violet-500/40 bg-violet-500/10" : "border-slate-800 bg-slate-950 hover:border-slate-700")}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-bold text-white">{store.storeName}</div>
                              <div className="mt-1 truncate text-xs text-slate-500">{store.storeId} · {formatLabel(store.platform)}</div>
                            </div>
                            <Badge tone="violet">{formatLabel(store.plan)}</Badge>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Badge tone={toneForStatus(store.status)}>{formatLabel(store.status)}</Badge>
                            <Badge tone={toneForStatus(store.paymentStatus)}>{formatLabel(store.paymentStatus)}</Badge>
                          </div>
                          <div className="mt-4">
                            <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-slate-500">
                              <span>Usage</span>
                              <span>{number.format(store.msgCount)} / {number.format(store.msgLimit)}</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-800">
                              <div className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-sky-400" style={{ width: `${usageWidth}%` }} />
                            </div>
                          </div>
                          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                            <span>{money.format(store.planPrice)}</span>
                            <span>{number.format(store.usageLeft)} left</span>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </aside>

              <aside className="rounded-[30px] border border-slate-800 bg-slate-950/70 p-4">
                <div className="border-b border-slate-800 pb-4">
                  <div className="text-sm font-bold text-white">Sidebar</div>
                  <div className="mt-1 text-sm text-slate-400">Jump between the main admin sections without scrolling the full page manually.</div>
                </div>
                <div className="mt-4 space-y-2">
                  {navItems.map(([id, label]) => (
                    <button
                      key={id}
                      onClick={() => jumpToSection(id)}
                      className="w-full rounded-2xl border border-slate-800 bg-[#050816] px-4 py-3 text-left text-sm font-semibold text-slate-300 transition hover:border-slate-700 hover:text-white"
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {selectedStore ? (
                  <div className="mt-4 rounded-2xl border border-slate-800 bg-[#050816] p-4">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Selected Store</div>
                    <div className="mt-2 text-sm font-bold text-white">{selectedStore.storeName}</div>
                    <div className="mt-1 text-xs text-slate-500">{selectedStore.storeId}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge tone={toneForStatus(selectedStore.setupStatus)}>{formatLabel(selectedStore.setupStatus)}</Badge>
                      <Badge tone={toneForStatus(selectedStore.workflowStatus)}>{formatLabel(selectedStore.workflowStatus)}</Badge>
                    </div>
                  </div>
                ) : null}
              </aside>

              <main className="space-y-6">
                {!selectedStore || !form ? (
                  <div className="flex min-h-[560px] items-center justify-center rounded-[30px] border border-dashed border-slate-800 bg-slate-950/60 p-8 text-center text-slate-500">Select a store from the queue to manage onboarding, workflows, usage, and notes.</div>
                ) : (
                  <>
                    <section className="rounded-[30px] border border-slate-800 bg-slate-950/70 p-6">
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-3xl font-black text-white">{selectedStore.storeName}</h2>
                            <Badge tone="slate">{selectedStore.storeId}</Badge>
                            <Badge tone="blue">{formatLabel(selectedStore.platform)}</Badge>
                          </div>
                          <div className="mt-2 text-sm text-slate-400">{selectedStore.storeUrl}</div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Badge tone={toneForStatus(selectedStore.status)}>{formatLabel(selectedStore.status)}</Badge>
                            <Badge tone="violet">Plan {formatLabel(selectedStore.plan)}</Badge>
                            <Badge tone={toneForStatus(selectedStore.paymentStatus)}>Payment {formatLabel(selectedStore.paymentStatus)}</Badge>
                            <Badge tone={toneForStatus(selectedStore.setupStatus)}>Setup {formatLabel(selectedStore.setupStatus)}</Badge>
                          </div>
                        </div>
                        <div className="grid gap-3 rounded-[24px] border border-slate-800 bg-[#050816] p-4 sm:grid-cols-2 xl:min-w-[420px]">
                          <div>
                            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Contact Email</div>
                            <div className="mt-2 text-sm font-semibold text-white">{selectedStore.contactEmail || "Not set"}</div>
                          </div>
                          <div>
                            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Created</div>
                            <div className="mt-2 text-sm font-semibold text-white">{formatDate(selectedStore.createdAt)}</div>
                          </div>
                          <div>
                            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Plan Revenue</div>
                            <div className="mt-2 text-sm font-semibold text-white">{money.format(selectedStore.planPrice)}</div>
                          </div>
                          <div>
                            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Usage Left</div>
                            <div className="mt-2 text-sm font-semibold text-white">{number.format(selectedStore.usageLeft)}</div>
                          </div>
                          <div className="sm:col-span-2">
                            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Plan Logic</div>
                            <div className="mt-2 text-sm font-semibold text-white">{planCapability}</div>
                          </div>
                        </div>
                      </div>
                    </section>

                    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                      <SectionCard title="Workflow Mapping" description="Use this mapping to decide which n8n workflow file to import and which live webhook path this store should use.">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="rounded-2xl border border-slate-800 bg-[#050816] p-4">
                            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Recommended workflow</div>
                            <div className="mt-2 text-sm font-semibold text-white">{workflowTemplate?.label || "Not available"}</div>
                          </div>
                          <div className="rounded-2xl border border-slate-800 bg-[#050816] p-4">
                            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Webhook path</div>
                            <div className="mt-2 text-sm font-semibold text-white">{workflowTemplate?.path || "Not available"}</div>
                          </div>
                          <div className="rounded-2xl border border-slate-800 bg-[#050816] p-4 md:col-span-2">
                            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Import file</div>
                            <div className="mt-2 break-all text-sm font-semibold text-white">{workflowTemplate?.file || "Not available"}</div>
                          </div>
                        </div>
                        <div className="mt-4 rounded-2xl border border-slate-800 bg-[#050816] p-4 text-sm leading-6 text-slate-300">
                          Import this workflow once in n8n for the matching plan and platform. After that, every store on the same plan and platform can use the same live webhook URL. Store separation happens by <span className="font-semibold text-white">store_id</span>, not by creating a new workflow every time.
                        </div>
                      </SectionCard>

                      <SectionCard title="Admin Checklist" description="This is the minimum state that should be true before you send install details and mark the store live.">
                        <div className="grid gap-4 md:grid-cols-2">
                          {adminChecklist.map((item) => (
                            <ChecklistItem key={item.label} done={item.done} label={item.label} detail={item.detail} />
                          ))}
                        </div>
                      </SectionCard>
                    </div>

                    <div id="admin-settings" className="grid gap-6 xl:grid-cols-2 scroll-mt-24">
                      <SectionCard title="Operations" description="Control account state, payment, workflow stage, and priority.">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <SelectField label="Store Status" value={form.status} onChange={(value) => setForm((current) => ({ ...current, status: value }))} options={statusOptions} />
                          <SelectField label="Plan" value={form.plan} onChange={(value) => setForm((current) => ({ ...current, plan: value }))} options={planOptions} />
                          <SelectField label="Payment Status" value={form.paymentStatus} onChange={(value) => setForm((current) => ({ ...current, paymentStatus: value }))} options={paymentOptions} />
                          <SelectField label="Priority" value={form.priority} onChange={(value) => setForm((current) => ({ ...current, priority: value }))} options={priorityOptions} />
                          <SelectField label="Setup Stage" value={form.setupStatus} onChange={(value) => setForm((current) => ({ ...current, setupStatus: value }))} options={setupOptions} />
                          <SelectField label="Workflow Status" value={form.workflowStatus} onChange={(value) => setForm((current) => ({ ...current, workflowStatus: value }))} options={workflowOptions} />
                          <SelectField label="Widget Status" value={form.widgetStatus} onChange={(value) => setForm((current) => ({ ...current, widgetStatus: value }))} options={widgetOptions} />
                          <InputField label="Payment Amount" type="number" value={form.paymentAmount} onChange={(value) => setForm((current) => ({ ...current, paymentAmount: Number(value) || 0 }))} />
                        </div>
                      </SectionCard>

                      <SectionCard title="Branding and usage" description="Widget branding and usage counters managed from the admin side.">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <InputField label="Messages Used" type="number" value={form.msgCount} onChange={(value) => setForm((current) => ({ ...current, msgCount: Number(value) || 0 }))} />
                          <InputField label="Message Limit" type="number" value={form.msgLimit} onChange={(value) => setForm((current) => ({ ...current, msgLimit: Number(value) || 0 }))} />
                          <InputField label="Agent Name" value={form.agentName} onChange={(value) => setForm((current) => ({ ...current, agentName: value }))} placeholder="Store assistant" />
                          <InputField label="Accent Color" value={form.accentColor} onChange={(value) => setForm((current) => ({ ...current, accentColor: value }))} placeholder="#7c3aed" />
                        </div>
                        <div className="mt-4">
                          <TextareaField label="Welcome Message" value={form.welcomeMessage} onChange={(value) => setForm((current) => ({ ...current, welcomeMessage: value }))} rows={3} />
                        </div>
                        <div className="mt-4 rounded-2xl border border-slate-800 bg-[#050816] p-4 text-sm leading-6 text-slate-300">
                          Usage totals refresh from live dashboard data. Starter is mainly message-limit based. Pro and Enterprise also rely on memory-enabled workflow logic.
                        </div>
                      </SectionCard>
                    </div>

                    <div id="admin-workflow" className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] scroll-mt-24">
                      <SectionCard title="Workflow" description="This is the internal setup area. Save the webhook, test it yourself, then send installation details manually when the store is ready.">
                        <div className="grid gap-4 lg:grid-cols-2">
                          <div className="rounded-2xl border border-slate-800 bg-[#050816] p-4">
                            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Store ID</div>
                            <div className="mt-2 text-sm font-semibold text-white">{selectedStore.storeId}</div>
                          </div>
                          <div className="rounded-2xl border border-slate-800 bg-[#050816] p-4">
                            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Platform</div>
                            <div className="mt-2 text-sm font-semibold text-white">{formatLabel(selectedStore.platform)}</div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <InputField label="Webhook URL *" value={form.webhookUrl} onChange={(value) => setForm((current) => ({ ...current, webhookUrl: value }))} placeholder="https://n8n.example.com/webhook/..." />
                        </div>
                        {!form.webhookUrl ? (
                          <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                            Save the workflow webhook first. Do your own QA before sending any installation details to the client.
                          </div>
                        ) : null}
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            onClick={() => applyStorePatch({ setupStatus: "workflow_building", workflowStatus: "draft" }, "Workflow moved to draft.")}
                            disabled={saving || !selectedId}
                            className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                          >
                            Prepare Workflow
                          </button>
                          <button
                            onClick={() =>
                              applyStorePatch(
                                {
                                  status: "active",
                                  setupStatus: "live",
                                  workflowStatus: "live",
                                  widgetStatus: "live",
                                },
                                "Store marked live."
                              )
                            }
                            disabled={saving || !selectedId || !form?.webhookUrl}
                            className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                          >
                            Mark Live
                          </button>
                        </div>
                        <div className="mt-4 rounded-2xl border border-slate-800 bg-[#050816] p-4 text-sm leading-6 text-slate-300">
                          Client installation is handled manually. After you test the workflow yourself, send the final instructions by email and let the client use the dashboard only for content and branding edits.
                        </div>
                        <div className="mt-4 rounded-2xl border border-slate-800 bg-[#050816] p-4">
                          <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Operator Steps</div>
                          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-300">
                            <li>Import or publish the workflow file shown above in n8n.</li>
                            <li>Copy the live webhook URL from n8n and save it here.</li>
                            <li>Test the workflow yourself with the real store data.</li>
                            <li>Send the install guide to the client after QA passes.</li>
                            <li>Mark the store live only after the previous steps are complete.</li>
                          </ol>
                        </div>
                        <div className="mt-4 grid gap-4">
                          <InputField label="Install Guide Email" value={installGuideEmail} onChange={setInstallGuideEmail} placeholder="client@store.com" />
                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={() => setInstallGuideText(selectedStore?.defaultInstallGuide || "")}
                              type="button"
                              className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
                            >
                              Use Default Template
                            </button>
                          </div>
                          <TextareaField label="Install Guide Details" value={installGuideText} onChange={setInstallGuideText} rows={8} placeholder="Write the final installation details you want saved on the dashboard and sent by email." />
                          <div className="flex flex-wrap gap-3">
                            <button onClick={sendInstallGuide} disabled={saving || !selectedId} className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 disabled:opacity-50">
                              {saving ? "Sending..." : "Send Install Guide"}
                            </button>
                          </div>
                          {selectedStore.installGuideSentAt ? (
                            <div className="text-xs text-slate-500">Last sent: {formatDate(selectedStore.installGuideSentAt)}</div>
                          ) : null}
                        </div>
                      </SectionCard>

                      <SectionCard title="Store context" description="Operational data captured from the client setup form and training notes.">
                        <div className="grid gap-4 lg:grid-cols-2">
                          <div className="rounded-2xl border border-slate-800 bg-[#050816] p-4">
                            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Categories</div>
                            <div className="mt-2 text-sm leading-6 text-white">{selectedStore.categories.join(", ") || "Not set"}</div>
                          </div>
                          <div className="rounded-2xl border border-slate-800 bg-[#050816] p-4">
                            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Delivery Methods</div>
                            <div className="mt-2 text-sm leading-6 text-white">{selectedStore.deliveryMethods.join(", ") || "Not set"}</div>
                          </div>
                          <div className="rounded-2xl border border-slate-800 bg-[#050816] p-4">
                            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Return Policy</div>
                            <div className="mt-2 text-sm leading-6 text-slate-300">{selectedStore.returnPolicy || "No return policy saved."}</div>
                          </div>
                          <div className="rounded-2xl border border-slate-800 bg-[#050816] p-4">
                            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Credentials</div>
                            <div className="mt-2 text-sm leading-6 text-slate-300">{selectedStore.credentialsPresent ? "Encrypted credentials stored in backend." : "No credentials stored."}</div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="rounded-2xl border border-slate-800 bg-[#050816] p-4">
                            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">FAQ Snapshot</div>
                            <div className="mt-2 max-h-52 overflow-y-auto text-sm leading-6 text-slate-300">{selectedStore.faqs || "No FAQs captured yet."}</div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <TextareaField label="Internal Notes" value={form.internalNotes} onChange={(value) => setForm((current) => ({ ...current, internalNotes: value }))} rows={8} placeholder="Track payment notes, workflow URLs, QA blockers, and client requests." />
                        </div>
                      </SectionCard>
                    </div>

                    <div id="admin-client-access" className="scroll-mt-24">
                      <SectionCard title="Client access" description="Check whether a dashboard login exists for an email and generate a temporary password if needed.">
                        <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto]">
                          <InputField label="Client Email" value={accountEmail} onChange={setAccountEmail} placeholder="client@store.com" />
                          <div className="flex items-end">
                            <button onClick={lookupClientAccount} disabled={accountLoading} className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
                              {accountLoading ? "Checking..." : "Check Account"}
                            </button>
                          </div>
                          <div className="flex items-end">
                            <button onClick={resetClientPassword} disabled={accountLoading} className="w-full rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 disabled:opacity-50">
                              Generate Temp Password
                            </button>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-4 xl:grid-cols-2">
                          <div className="rounded-2xl border border-slate-800 bg-[#050816] p-4">
                            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Account Status</div>
                            {!accountLookup ? <div className="mt-2 text-sm text-slate-400">No lookup yet.</div> : null}
                            {accountLookup && !accountLookup.exists ? <div className="mt-2 text-sm text-amber-300">No client account found for this email.</div> : null}
                            {accountLookup?.exists ? (
                              <div className="mt-3 space-y-2 text-sm text-slate-300">
                                <div><span className="text-slate-500">Email:</span> {accountLookup.user?.email}</div>
                                <div><span className="text-slate-500">Store ID:</span> {accountLookup.user?.store_id}</div>
                                <div><span className="text-slate-500">Active:</span> {accountLookup.user?.is_active ? "Yes" : "No"}</div>
                                <div><span className="text-slate-500">Created:</span> {formatDate(accountLookup.user?.created_at)}</div>
                                {accountLookup.store ? (
                                  <div><span className="text-slate-500">Store:</span> {accountLookup.store.storeName} ({accountLookup.store.storeId})</div>
                                ) : null}
                              </div>
                            ) : null}
                          </div>

                          <div className="rounded-2xl border border-slate-800 bg-[#050816] p-4">
                            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Temporary Password</div>
                            {tempPassword ? (
                              <div className="mt-3">
                                <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 font-mono text-sm text-violet-100">{tempPassword}</div>
                                <p className="mt-3 text-xs text-slate-400">This replaces the old password. Copy it and send it to the client manually.</p>
                              </div>
                            ) : (
                              <div className="mt-2 text-sm text-slate-400">No temporary password generated yet.</div>
                            )}
                          </div>
                        </div>
                      </SectionCard>
                    </div>

                    <div id="admin-activity" className="scroll-mt-24">
                      <div className="flex flex-col gap-4 rounded-[28px] border border-slate-800 bg-slate-950/70 p-5 xl:flex-row xl:items-center xl:justify-between">
                        <div className="text-sm text-slate-400">Last active: {formatDate(selectedStore.lastActiveAt)} · Last synced: {formatDate(selectedStore.lastSyncedAt)}</div>
                        <div className="flex flex-wrap gap-3">
                          <button onClick={saveStore} disabled={saving} className="rounded-2xl bg-white px-6 py-3 text-sm font-bold text-slate-950 disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

