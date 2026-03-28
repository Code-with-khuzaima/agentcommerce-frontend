import { useEffect, useState } from "react";
import { apiGet, apiPatch, apiPost, clearAdminSession } from "./api";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const number = new Intl.NumberFormat("en-US");

const statusOptions = ["pending", "review", "active", "paused", "archived"];
const planOptions = ["starter", "pro", "enterprise"];
const paymentOptions = ["pending", "paid", "overdue", "refunded"];
const setupOptions = ["new", "credentials_review", "workflow_building", "widget_installing", "qa_testing", "live"];
const workflowOptions = ["not_started", "draft", "ready", "live", "issue"];
const widgetOptions = ["not_installed", "ready", "live", "paused"];
const priorityOptions = ["low", "medium", "high", "urgent"];

const cls = (...values) => values.filter(Boolean).join(" ");
const formatLabel = (value) => String(value || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : date.toLocaleString();
}

function Pill({ children, tone = "slate" }) {
  const tones = {
    slate: "border-white/10 bg-white/5 text-slate-300",
    violet: "border-violet-400/20 bg-violet-500/10 text-violet-300",
    green: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
    amber: "border-amber-400/20 bg-amber-500/10 text-amber-300",
    rose: "border-rose-400/20 bg-rose-500/10 text-rose-300",
    blue: "border-sky-400/20 bg-sky-500/10 text-sky-300",
  };
  return <span className={cls("inline-flex rounded-full border px-3 py-1 text-xs font-semibold", tones[tone])}>{children}</span>;
}

function StatCard({ title, value, hint }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl">
      <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{title}</div>
      <div className="mt-3 text-3xl font-black text-white">{value}</div>
      <div className="mt-2 text-sm text-slate-400">{hint}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <Field label={label}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-violet-400/30">
        {options.map((option) => <option key={option} value={option}>{formatLabel(option)}</option>)}
      </select>
    </Field>
  );
}

function InputField({ label, value, onChange, type = "text", placeholder }) {
  return (
    <Field label={label}>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-400/30" />
    </Field>
  );
}

function TextareaField({ label, value, onChange, rows = 4, placeholder }) {
  return (
    <Field label={label}>
      <textarea rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-400/30" />
    </Field>
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
  const [logMessage, setLogMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleLogout() {
    clearAdminSession();
    localStorage.removeItem("ac_admin_auth");
    window.location.replace("/admin");
  }

  async function loadDashboard(nextFilters = filters, preferredId = selectedId) {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      Object.entries(nextFilters).forEach(([key, value]) => value && value !== "all" && params.set(key, value));
      const data = await apiGet(`/admin/dashboard${params.toString() ? `?${params.toString()}` : ""}`);
      setSummary(data.summary);
      setStores(data.stores);
      const nextId = preferredId && data.stores.some((store) => store.id === preferredId) ? preferredId : data.stores[0]?.id || null;
      setSelectedId(nextId);
      if (nextId) {
        const detail = await apiGet(`/admin/stores/${nextId}`);
        setSelectedStore(detail.store);
        setForm(mapForm(detail.store));
      } else {
        setSelectedStore(null);
        setForm(null);
      }
    } catch (err) {
      setError(err.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  async function openStore(id) {
    setSelectedId(id);
    setError("");
    try {
      const detail = await apiGet(`/admin/stores/${id}`);
      setSelectedStore(detail.store);
      setForm(mapForm(detail.store));
    } catch (err) {
      setError(err.message || "Failed to load store.");
    }
  }

  // We intentionally bootstrap once on mount and then refresh through explicit actions.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadDashboard(filters, null);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function saveStore() {
    if (!selectedId || !form) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await apiPatch(`/admin/stores/${selectedId}`, form);
      await loadDashboard(filters, selectedId);
      setSuccess("Store updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to save store.");
    } finally {
      setSaving(false);
    }
  }

  async function addLog(event) {
    if (!selectedId) return;
    setSaving(true);
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

  const cards = summary ? [
    ["Total Stores", number.format(summary.totalStores), `${summary.pendingStores} waiting for review`],
    ["Active Stores", number.format(summary.activeStores), `${summary.widgetLive} widgets already live`],
    ["Monthly Revenue", money.format(summary.monthlyRevenue), `${money.format(summary.collectedRevenue)} confirmed paid`],
    ["Unpaid Revenue", money.format(summary.unpaidRevenue), `${summary.paymentPending} stores need payment follow-up`],
    ["Messages Used", number.format(summary.totalMessagesUsed), `${number.format(summary.totalUsageLeft)} messages still available`],
    ["Setup Queue", number.format(summary.setupQueue), `${summary.workflowReady} workflows ready`],
  ] : [];

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-[1680px] px-5 py-8 sm:px-8">
        <div className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.22),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.12),_transparent_25%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] p-8 shadow-[0_30px_120px_rgba(2,6,23,0.85)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-violet-300">Admin Control Center</div>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">AgentCommerce Dashboard</h1>
              <p className="mt-3 max-w-3xl text-base text-slate-400">Manage onboarding, active stores, revenue, plan limits, usage left, workflow setup, widget status, and internal notes from one clean admin view.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => loadDashboard(filters, selectedId)} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20">Refresh Data</button>
              <button onClick={() => addLog("manual_follow_up")} disabled={!selectedId || saving} className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 disabled:opacity-50">Log Follow-Up</button>
              <button onClick={handleLogout} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20">Log Out</button>
            </div>
          </div>

          {error && <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}
          {success && <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{success}</div>}

          <div className="mt-8 grid gap-4 xl:grid-cols-6">
            {cards.map(([title, value, hint]) => <StatCard key={title} title={title} value={value} hint={hint} />)}
          </div>

          <div className="mt-8 grid gap-4 rounded-[28px] border border-white/10 bg-white/[0.03] p-5 xl:grid-cols-[2fr_1fr_1fr_1fr_auto]">
            <InputField label="Search Stores" value={filters.search} onChange={(value) => setFilters((current) => ({ ...current, search: value }))} placeholder="Store, email, URL, ID" />
            <SelectField label="Status" value={filters.status} onChange={(value) => setFilters((current) => ({ ...current, status: value }))} options={["all", ...statusOptions]} />
            <SelectField label="Plan" value={filters.plan} onChange={(value) => setFilters((current) => ({ ...current, plan: value }))} options={["all", ...planOptions]} />
            <SelectField label="Platform" value={filters.platform} onChange={(value) => setFilters((current) => ({ ...current, platform: value }))} options={["all", "shopify", "woocommerce"]} />
            <div className="flex items-end gap-3">
              <button onClick={() => loadDashboard(filters, selectedId)} className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950">Apply</button>
              <button onClick={() => { const reset = { search: "", status: "all", plan: "all", platform: "all" }; setFilters(reset); loadDashboard(reset, null); }} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white">Reset</button>
            </div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[510px_minmax(0,1fr)]">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Stores Inbox</h2>
                  <p className="mt-1 text-sm text-slate-500">New submissions, active clients, payment follow-up, and launch queue.</p>
                </div>
                <Pill tone="blue">{stores.length} stores</Pill>
              </div>
              <div className="mt-5 max-h-[980px] space-y-4 overflow-y-auto pr-1">
                {loading && <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-slate-400">Loading dashboard data...</div>}
                {!loading && stores.length === 0 && <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-slate-400">No stores match your current filters.</div>}
                {!loading && stores.map((store) => {
                  const usageWidth = store.msgLimit ? Math.min((store.msgCount / store.msgLimit) * 100, 100) : 0;
                  return (
                    <button key={store.id} onClick={() => openStore(store.id)} className={cls("w-full rounded-3xl border p-4 text-left transition", selectedId === store.id ? "border-violet-400/40 bg-violet-500/10" : "border-white/10 bg-white/[0.03] hover:border-white/20")}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-bold text-white">{store.storeName}</div>
                          <div className="mt-1 text-xs text-slate-500">{store.storeId} • {store.platform}</div>
                        </div>
                        <Pill tone="violet">{formatLabel(store.plan)}</Pill>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Pill tone={store.status === "active" ? "green" : "amber"}>{formatLabel(store.status)}</Pill>
                        <Pill tone={store.paymentStatus === "paid" ? "green" : "amber"}>{formatLabel(store.paymentStatus)}</Pill>
                        <Pill>{number.format(store.usageLeft)} left</Pill>
                      </div>
                      <div className="mt-4">
                        <div className="mb-1 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-slate-500">
                          <span>Usage</span>
                          <span>{number.format(store.msgCount)} / {number.format(store.msgLimit)}</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/5"><div className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400" style={{ width: `${usageWidth}%` }} /></div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-400">
                        <div><div className="text-slate-500">Revenue</div><div className="mt-1 font-semibold text-white">{money.format(store.planPrice)}</div></div>
                        <div><div className="text-slate-500">Updated</div><div className="mt-1 font-semibold text-white">{formatDate(store.updatedAt)}</div></div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
              {!selectedStore || !form ? (
                <div className="flex min-h-[640px] items-center justify-center rounded-[24px] border border-dashed border-white/10 text-slate-500">Select a store to manage setup, plan, revenue, widget state, and internal operations.</div>
              ) : (
                <div className="space-y-8">
                  <div className="flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-3xl font-black text-white">{selectedStore.storeName}</h2>
                        <Pill>{selectedStore.storeId}</Pill>
                        <Pill tone="blue">{formatLabel(selectedStore.platform)}</Pill>
                      </div>
                      <div className="mt-3 text-sm text-slate-400">{selectedStore.storeUrl}</div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Pill tone={selectedStore.status === "active" ? "green" : "amber"}>{formatLabel(selectedStore.status)}</Pill>
                        <Pill tone="violet">Plan {formatLabel(selectedStore.plan)}</Pill>
                        <Pill tone={selectedStore.paymentStatus === "paid" ? "green" : "amber"}>Payment {formatLabel(selectedStore.paymentStatus)}</Pill>
                        <Pill tone="blue">Workflow {formatLabel(selectedStore.workflowStatus)}</Pill>
                        <Pill tone="rose">Widget {formatLabel(selectedStore.widgetStatus)}</Pill>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 rounded-[24px] border border-white/10 bg-slate-950/60 p-4 text-sm sm:min-w-[320px]">
                      <div><div className="text-slate-500">Contact</div><div className="mt-1 font-semibold text-white">{selectedStore.contactEmail}</div></div>
                      <div><div className="text-slate-500">Created</div><div className="mt-1 font-semibold text-white">{formatDate(selectedStore.createdAt)}</div></div>
                      <div><div className="text-slate-500">Plan Revenue</div><div className="mt-1 font-semibold text-white">{money.format(selectedStore.planPrice)}</div></div>
                      <div><div className="text-slate-500">Usage Left</div><div className="mt-1 font-semibold text-white">{number.format(selectedStore.usageLeft)}</div></div>
                    </div>
                  </div>

                  <div className="grid gap-5 xl:grid-cols-2">
                    <div className="rounded-[24px] border border-white/10 bg-slate-950/50 p-5">
                      <h3 className="text-lg font-bold text-white">Operations</h3>
                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <SelectField label="Store Status" value={form.status} onChange={(value) => setForm((current) => ({ ...current, status: value }))} options={statusOptions} />
                        <SelectField label="Plan" value={form.plan} onChange={(value) => setForm((current) => ({ ...current, plan: value }))} options={planOptions} />
                        <SelectField label="Payment" value={form.paymentStatus} onChange={(value) => setForm((current) => ({ ...current, paymentStatus: value }))} options={paymentOptions} />
                        <SelectField label="Priority" value={form.priority} onChange={(value) => setForm((current) => ({ ...current, priority: value }))} options={priorityOptions} />
                        <SelectField label="Setup Stage" value={form.setupStatus} onChange={(value) => setForm((current) => ({ ...current, setupStatus: value }))} options={setupOptions} />
                        <SelectField label="Workflow" value={form.workflowStatus} onChange={(value) => setForm((current) => ({ ...current, workflowStatus: value }))} options={workflowOptions} />
                        <SelectField label="Widget" value={form.widgetStatus} onChange={(value) => setForm((current) => ({ ...current, widgetStatus: value }))} options={widgetOptions} />
                        <InputField label="Payment Amount" value={form.paymentAmount} onChange={(value) => setForm((current) => ({ ...current, paymentAmount: Number(value) || 0 }))} type="number" />
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-white/10 bg-slate-950/50 p-5">
                      <h3 className="text-lg font-bold text-white">Usage & Branding</h3>
                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <InputField label="Messages Used" value={form.msgCount} onChange={(value) => setForm((current) => ({ ...current, msgCount: Number(value) || 0 }))} type="number" />
                        <InputField label="Message Limit" value={form.msgLimit} onChange={(value) => setForm((current) => ({ ...current, msgLimit: Number(value) || 0 }))} type="number" />
                        <InputField label="Agent Name" value={form.agentName} onChange={(value) => setForm((current) => ({ ...current, agentName: value }))} placeholder="Store assistant name" />
                        <InputField label="Accent Color" value={form.accentColor} onChange={(value) => setForm((current) => ({ ...current, accentColor: value }))} placeholder="#7c3aed" />
                      </div>
                      <div className="mt-4">
                        <InputField label="Webhook URL" value={form.webhookUrl} onChange={(value) => setForm((current) => ({ ...current, webhookUrl: value }))} placeholder="https://n8n.example.com/webhook/..." />
                      </div>
                      <div className="mt-4">
                        <TextareaField label="Welcome Message" value={form.welcomeMessage} onChange={(value) => setForm((current) => ({ ...current, welcomeMessage: value }))} rows={3} />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-[24px] border border-white/10 bg-slate-950/50 p-5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white">Client Context</h3>
                        <Pill tone="violet">{selectedStore.qnaCount} trained Q&A</Pill>
                      </div>
                      <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        <div className="space-y-4 rounded-[20px] border border-white/10 bg-white/[0.02] p-4">
                          <div>
                            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Categories</div>
                            <div className="mt-2 text-sm text-white">{selectedStore.categories.join(", ") || "Not set"}</div>
                          </div>
                          <div>
                            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Delivery Methods</div>
                            <div className="mt-2 text-sm text-white">{selectedStore.deliveryMethods.join(", ") || "Not set"}</div>
                          </div>
                          <div>
                            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Return Policy</div>
                            <div className="mt-2 text-sm leading-6 text-slate-300">{selectedStore.returnPolicy || "No return policy saved yet."}</div>
                          </div>
                        </div>
                        <div className="space-y-4 rounded-[20px] border border-white/10 bg-white/[0.02] p-4">
                          <div>
                            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Client Notes</div>
                            <div className="mt-2 text-sm leading-6 text-slate-300">{selectedStore.notes || "No notes captured yet."}</div>
                          </div>
                          <div>
                            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">FAQ Snapshot</div>
                            <div className="mt-2 max-h-44 overflow-y-auto text-sm leading-6 text-slate-300">{selectedStore.faqs || "No FAQs captured yet."}</div>
                          </div>
                          <div>
                            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Credentials</div>
                            <div className="mt-2 text-sm leading-6 text-slate-300">{selectedStore.credentialsPresent ? "Encrypted credentials stored in backend" : "No credentials saved"}</div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <TextareaField label="Admin Notes" value={form.internalNotes} onChange={(value) => setForm((current) => ({ ...current, internalNotes: value }))} rows={7} placeholder="Track workflow URLs, client requests, payment notes, QA notes, and next actions." />
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-white/10 bg-slate-950/50 p-5">
                      <h3 className="text-lg font-bold text-white">Activity Timeline</h3>
                      <div className="mt-4 space-y-3 rounded-[20px] border border-white/10 bg-white/[0.02] p-4">
                        <TextareaField label="Quick Log Note" value={logMessage} onChange={setLogMessage} rows={4} placeholder="Example: Payment received. Workflow moved to QA test." />
                        <div className="grid gap-3 sm:grid-cols-3">
                          <button onClick={() => addLog("workflow_prepared")} disabled={saving} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">Workflow Ready</button>
                          <button onClick={() => addLog("widget_published")} disabled={saving} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">Widget Live</button>
                          <button onClick={() => addLog("client_follow_up")} disabled={saving} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">Client Follow-Up</button>
                        </div>
                      </div>
                      <div className="mt-4 max-h-[430px] space-y-3 overflow-y-auto pr-1">
                        {(selectedStore.logs || []).map((log) => (
                          <div key={log.id} className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div className="text-sm font-bold text-white">{formatLabel(log.event)}</div>
                              <div className="text-xs text-slate-500">{formatDate(log.createdAt)}</div>
                            </div>
                            <div className="mt-2 text-sm leading-6 text-slate-300">{typeof log.payload?.note === "string" ? log.payload.note : JSON.stringify(log.payload)}</div>
                          </div>
                        ))}
                        {(!selectedStore.logs || selectedStore.logs.length === 0) && <div className="rounded-[20px] border border-dashed border-white/10 p-4 text-sm text-slate-500">No activity logs yet. Use the quick actions above to track work as you go.</div>}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
                    <div className="text-sm text-slate-500">Last active: {formatDate(selectedStore.lastActiveAt)} • Last synced: {formatDate(selectedStore.lastSyncedAt)}</div>
                    <div className="flex flex-wrap gap-3">
                      <button onClick={() => setForm((current) => ({ ...current, setupStatus: "workflow_building", workflowStatus: "draft" }))} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white">Prepare Workflow</button>
                      <button onClick={() => setForm((current) => ({ ...current, widgetStatus: "live", status: "active", setupStatus: "live" }))} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white">Mark Go-Live</button>
                      <button onClick={saveStore} disabled={saving} className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/20 disabled:opacity-50">{saving ? "Saving..." : "Save Store Changes"}</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
