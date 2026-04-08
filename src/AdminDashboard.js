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
  const [copied, setCopied] = useState("");

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

  function copy(text, key) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
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

  const navItems = [
    ["admin-overview", "Overview"],
    ["admin-queue", "Store Queue"],
    ["admin-settings", "Store Settings"],
    ["admin-workflow", "Workflow"],
    ["admin-client-access", "Client Access"],
    ["admin-activity", "Activity"],
  ];

  const installSnippet = selectedStore
    ? `<!-- AgentComerce Widget -->\n<script>\n  window.AgentComerce = {\n    store_id: "${selectedStore.storeId || "store_001"}"\n  };\n</script>\n<script src="https://agentcommerce-frontend-git-master-code-with-khuzaimas-projects.vercel.app/widget.js"></script>`
    : "";
  const widgetTestUrl = selectedStore
    ? `https://agentcommerce-frontend-git-master-code-with-khuzaimas-projects.vercel.app/widget-test.html?store_id=${encodeURIComponent(selectedStore.storeId || "store_001")}`
    : "";

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-[1720px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[36px] border border-slate-800 bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.18),_transparent_30%),linear-gradient(180deg,rgba(2,6,23,0.96),rgba(2,6,23,1))] shadow-[0_40px_120px_rgba(2,6,23,0.82)]">
          <div className="border-b border-slate-800 px-5 py-5 sm:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-300">Admin Dashboard</div>
                <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">Operations, onboarding, and store control</h1>
                <p className="mt-2 max-w-3xl text-sm text-slate-400">This view is rebuilt for workflow operations. It keeps the same data and actions, but the layout is simpler and more usable.</p>
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
                              <div className="mt-1 truncate text-xs text-slate-500">{store.storeId} Â· {formatLabel(store.platform)}</div>
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
                        </div>
                      </div>
                    </section>

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

                      <SectionCard title="Branding, usage, and routing" description="Widget branding, usage counters, and the store webhook used for live chat routing.">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <InputField label="Messages Used" type="number" value={form.msgCount} onChange={(value) => setForm((current) => ({ ...current, msgCount: Number(value) || 0 }))} />
                          <InputField label="Message Limit" type="number" value={form.msgLimit} onChange={(value) => setForm((current) => ({ ...current, msgLimit: Number(value) || 0 }))} />
                          <InputField label="Agent Name" value={form.agentName} onChange={(value) => setForm((current) => ({ ...current, agentName: value }))} placeholder="Store assistant" />
                          <InputField label="Accent Color" value={form.accentColor} onChange={(value) => setForm((current) => ({ ...current, accentColor: value }))} placeholder="#7c3aed" />
                        </div>
                        <div className="mt-4">
                          <InputField label="Webhook URL *" value={form.webhookUrl} onChange={(value) => setForm((current) => ({ ...current, webhookUrl: value }))} placeholder="https://n8n.example.com/webhook/..." />
                        </div>
                        <div className="mt-4">
                          <TextareaField label="Welcome Message" value={form.welcomeMessage} onChange={(value) => setForm((current) => ({ ...current, welcomeMessage: value }))} rows={3} />
                        </div>
                        {!form.webhookUrl ? (
                          <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                            This store does not have a webhook URL yet. The widget can render, but chat routing will fail until you save the workflow webhook here.
                          </div>
                        ) : null}
                      </SectionCard>
                    </div>

                    <div id="admin-workflow" className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] scroll-mt-24">
                      <SectionCard title="Workflow and install" description="Finish setup here: save the webhook, copy the install snippet, then test and mark the store live.">
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
                            Save the workflow webhook first. Without it, the widget can render but chat will not work.
                          </div>
                        ) : null}
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button onClick={() => copy(installSnippet, "install-snippet")} className={cx("rounded-2xl px-5 py-3 text-sm font-semibold", copied === "install-snippet" ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "bg-white text-slate-950")}>
                            {copied === "install-snippet" ? "Copied" : "Copy Install Snippet"}
                          </button>
                          <a href={widgetTestUrl} target="_blank" rel="noreferrer" className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:border-slate-600">
                            Open Test Page
                          </a>
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
                        <div className="mt-4 rounded-2xl border border-slate-800 bg-[#050816] p-4">
                          <div className="mb-2 text-[11px] uppercase tracking-[0.2em] text-slate-500">Install Snippet</div>
                          <pre className="overflow-x-auto text-xs leading-6 text-slate-300">{installSnippet}</pre>
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
                      <div className="text-sm text-slate-400">Last active: {formatDate(selectedStore.lastActiveAt)} Â· Last synced: {formatDate(selectedStore.lastSyncedAt)}</div>
                      <div className="flex flex-wrap gap-3">
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

