import { useEffect, useMemo, useState } from "react";
import { API_BASE, apiGet, apiPatch, apiPost, clearAdminSession } from "./api";

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
  };

  return <span className={cx("inline-flex max-w-full rounded-xl border px-3 py-1 text-xs font-semibold", tones[tone])}>{children}</span>;
}

function Field({ label, children }) {
  return (
    <label className="flex min-w-0 flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <Field label={label}>
      <select value={value || ""} onChange={(event) => onChange(event.target.value)} className="min-w-0 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none">
        {options.map((option) => <option key={option} value={option}>{formatLabel(option)}</option>)}
      </select>
    </Field>
  );
}

function InputField({ label, value, onChange, placeholder = "", type = "text" }) {
  return (
    <Field label={label}>
      <input type={type} value={value ?? ""} placeholder={placeholder} onChange={(event) => onChange(type === "number" ? Number(event.target.value) : event.target.value)} className="min-w-0 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600" />
    </Field>
  );
}

function TextareaField({ label, value, onChange, placeholder = "", rows = 4 }) {
  return (
    <Field label={label}>
      <textarea rows={rows} value={value || ""} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="min-w-0 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600" />
    </Field>
  );
}

function Panel({ title, children, action }) {
  return (
    <section className="min-w-0 rounded-[24px] border border-slate-800 bg-slate-950/80 p-4 sm:p-5">
      <div className="flex flex-col gap-3 border-b border-slate-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function widgetScriptUrl() {
  if (typeof window === "undefined") return "/widget.js";
  return `${window.location.origin}/widget.js`;
}

function buildWidgetSnippet(store) {
  const storeId = store?.storeId || "store_id_here";
  return [
    "<script>",
    `  window.AgentComerce = { store_id: ${JSON.stringify(storeId)}, api_base: ${JSON.stringify(API_BASE)} };`,
    "</script>",
    `<script src="${widgetScriptUrl()}" async data-agentcomerce-widget="true" data-api-base="${API_BASE}"></script>`,
  ].join("\n");
}

function workflowTemplateFor(store) {
  if (!store) return null;
  const key = `${store.plan || "starter"}:${store.platform || "shopify"}`;
  const map = {
    "starter:shopify": ["Starter Shopify", "starter-shopify-chat"],
    "starter:woocommerce": ["Starter WooCommerce", "starter-woocommerce-chat"],
    "pro:shopify": ["Pro Shopify", "pro-shopify-chat"],
    "pro:woocommerce": ["Pro WooCommerce", "pro-woocommerce-chat"],
    "enterprise:shopify": ["Enterprise Shopify", "enterprise-shopify-chat"],
    "enterprise:woocommerce": ["Enterprise WooCommerce", "enterprise-woocommerce-chat"],
  };
  const item = map[key];
  return item ? { label: item[0], path: item[1] } : null;
}

function mapForm(store) {
  return {
    status: store.status || "pending",
    plan: store.plan || "starter",
    paymentStatus: store.paymentStatus || "pending",
    setupStatus: store.setupStatus || "new",
    workflowStatus: store.workflowStatus || "not_started",
    widgetStatus: store.widgetStatus || "not_installed",
    priority: store.priority || "medium",
    msgCount: store.msgCount || 0,
    msgLimit: store.msgLimit || 5000,
    paymentAmount: store.paymentAmount || 0,
    webhookUrl: store.webhookUrl || "",
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
  const [accountEmail, setAccountEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [installGuideEmail, setInstallGuideEmail] = useState("");
  const [installGuideText, setInstallGuideText] = useState("");

  function handleLogout() {
    clearAdminSession();
    localStorage.removeItem("ac_admin_auth");
    window.location.replace("/admin");
  }

  async function openStore(id) {
    setSelectedId(id);
    setError("");
    setTempPassword("");
    const detail = await apiGet(`/admin/stores/${id}`);
    setSelectedStore(detail.store);
    setForm(mapForm(detail.store));
    setAccountEmail(detail.store?.loginEmail || "");
    setInstallGuideEmail(detail.store?.contactEmail || detail.store?.loginEmail || "");
    setInstallGuideText(detail.store?.installGuide || detail.store?.defaultInstallGuide || "");
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
      if (nextId) await openStore(nextId);
      else {
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

  async function quickPatch(patch, message) {
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

  async function resetClientPassword() {
    if (!accountEmail.trim()) return setError("Enter client email first.");
    setSaving(true);
    setError("");
    setSuccess("");
    setTempPassword("");
    try {
      const result = await apiPost("/admin/client-user/reset-password", { email: accountEmail.trim().toLowerCase() });
      setTempPassword(result.temporaryPassword || "");
      setSuccess("Temporary password generated.");
    } catch (err) {
      setError(err.message || "Failed to reset client password.");
    } finally {
      setSaving(false);
    }
  }

  async function sendInstallGuide() {
    if (!selectedId) return;
    if (!installGuideEmail.trim()) return setError("Enter install guide email.");
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

  const selectedTemplate = useMemo(() => workflowTemplateFor(selectedStore), [selectedStore]);
  const widgetSnippet = useMemo(() => buildWidgetSnippet(selectedStore), [selectedStore]);
  const stats = summary || {};

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050816] text-white">
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <header className="rounded-[28px] border border-slate-800 bg-slate-950 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-300">Admin</div>
              <h1 className="mt-2 break-words text-2xl font-black text-white sm:text-4xl">Store Operations</h1>
              <p className="mt-2 text-sm text-slate-400">Review submissions, update status, send install details, and manage client access.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => loadDashboard(filters, selectedId)} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-white">Refresh</button>
              <button onClick={handleLogout} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-white">Log Out</button>
            </div>
          </div>
          {error ? <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div> : null}
          {success ? <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{success}</div> : null}
        </header>

        <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <InfoStat label="Total" value={stats.totalStores || 0} />
          <InfoStat label="Pending" value={stats.pendingStores || 0} />
          <InfoStat label="Active" value={stats.activeStores || 0} />
          <InfoStat label="Setup Queue" value={stats.setupQueue || 0} />
        </section>

        <main className="mt-5 grid min-w-0 gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="min-w-0 rounded-[28px] border border-slate-800 bg-slate-950/80 p-4">
            <div className="grid gap-3">
              <InputField label="Search" value={filters.search} onChange={(value) => setFilters((current) => ({ ...current, search: value }))} placeholder="Store, email, URL, ID" />
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <SelectField label="Status" value={filters.status} onChange={(value) => setFilters((current) => ({ ...current, status: value }))} options={["all", ...statusOptions]} />
                <SelectField label="Plan" value={filters.plan} onChange={(value) => setFilters((current) => ({ ...current, plan: value }))} options={["all", ...planOptions]} />
                <SelectField label="Platform" value={filters.platform} onChange={(value) => setFilters((current) => ({ ...current, platform: value }))} options={["all", "shopify", "woocommerce"]} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => loadDashboard(filters, selectedId)} className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950">Apply</button>
                <button onClick={() => { const reset = { search: "", status: "all", plan: "all", platform: "all" }; setFilters(reset); loadDashboard(reset, null); }} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-white">Reset</button>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {loading ? <div className="rounded-2xl border border-slate-800 p-4 text-sm text-slate-400">Loading stores...</div> : null}
              {!loading && stores.length === 0 ? <div className="rounded-2xl border border-slate-800 p-4 text-sm text-slate-400">No stores found.</div> : null}
              {stores.map((store) => (
                <button key={store.id} onClick={() => openStore(store.id)} className={cx("w-full min-w-0 rounded-2xl border p-4 text-left", selectedId === store.id ? "border-violet-500/40 bg-violet-500/10" : "border-slate-800 bg-slate-950")}>
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-white">{store.storeName}</div>
                      <div className="mt-1 truncate text-xs text-slate-500">{store.storeId} - {formatLabel(store.platform)}</div>
                    </div>
                    <Badge tone="violet">{formatLabel(store.plan)}</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge tone={toneForStatus(store.status)}>{formatLabel(store.status)}</Badge>
                    <Badge tone={toneForStatus(store.paymentStatus)}>{formatLabel(store.paymentStatus)}</Badge>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <section className="min-w-0">
            {!selectedStore || !form ? (
              <div className="rounded-[28px] border border-dashed border-slate-800 bg-slate-950/60 p-8 text-center text-sm text-slate-400">Select a store to manage it.</div>
            ) : (
              <div className="grid min-w-0 gap-5">
                <Panel title={selectedStore.storeName} action={<Badge tone="slate">{selectedStore.storeId}</Badge>}>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <InfoStat label="Platform" value={formatLabel(selectedStore.platform)} />
                    <InfoStat label="Plan" value={formatLabel(selectedStore.plan)} />
                    <InfoStat label="Email" value={selectedStore.contactEmail || selectedStore.loginEmail || "Not set"} />
                    <InfoStat label="Created" value={formatDate(selectedStore.createdAt)} />
                  </div>
                  <div className="mt-4 break-words text-sm text-slate-400 [overflow-wrap:anywhere]">{selectedStore.storeUrl}</div>
                </Panel>

                <Panel title="Status">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <SelectField label="Store" value={form.status} onChange={(value) => setForm((current) => ({ ...current, status: value }))} options={statusOptions} />
                    <SelectField label="Payment" value={form.paymentStatus} onChange={(value) => setForm((current) => ({ ...current, paymentStatus: value }))} options={paymentOptions} />
                    <SelectField label="Setup" value={form.setupStatus} onChange={(value) => setForm((current) => ({ ...current, setupStatus: value }))} options={setupOptions} />
                    <SelectField label="Priority" value={form.priority} onChange={(value) => setForm((current) => ({ ...current, priority: value }))} options={priorityOptions} />
                    <SelectField label="Plan" value={form.plan} onChange={(value) => setForm((current) => ({ ...current, plan: value }))} options={planOptions} />
                    <SelectField label="Workflow" value={form.workflowStatus} onChange={(value) => setForm((current) => ({ ...current, workflowStatus: value }))} options={workflowOptions} />
                    <SelectField label="Widget" value={form.widgetStatus} onChange={(value) => setForm((current) => ({ ...current, widgetStatus: value }))} options={widgetOptions} />
                    <InputField label="Payment Amount" type="number" value={form.paymentAmount} onChange={(value) => setForm((current) => ({ ...current, paymentAmount: Number(value) || 0 }))} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button onClick={saveStore} disabled={saving} className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
                    <button onClick={() => quickPatch({ setupStatus: "workflow_building", workflowStatus: "draft" }, "Workflow marked draft.")} disabled={saving} className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">Workflow Draft</button>
                    <button onClick={() => quickPatch({ status: "active", setupStatus: "live", workflowStatus: "live", widgetStatus: "live" }, "Store marked live.")} disabled={saving || !form.webhookUrl} className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-100 disabled:opacity-50">Mark Live</button>
                  </div>
                </Panel>

                <Panel title="Workflow And Install">
                  <div className="grid gap-4 xl:grid-cols-2">
                    <div className="grid gap-3">
                      <InfoStat label="Workflow" value={selectedTemplate?.label || "Not available"} />
                      <InfoStat label="Webhook Path" value={selectedTemplate?.path || "Not available"} />
                      <InputField label="Live Webhook URL" value={form.webhookUrl} onChange={(value) => setForm((current) => ({ ...current, webhookUrl: value }))} placeholder="https://n8n.example.com/webhook/..." />
                      <TextareaField label="Internal Notes" value={form.internalNotes} onChange={(value) => setForm((current) => ({ ...current, internalNotes: value }))} rows={5} />
                    </div>
                    <div className="min-w-0 rounded-2xl border border-slate-800 bg-[#050816] p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Widget Snippet</div>
                      <pre className="mt-3 max-h-64 min-w-0 overflow-x-hidden whitespace-pre-wrap break-words rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs leading-6 text-slate-200">
                        <code>{widgetSnippet}</code>
                      </pre>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3">
                    <InputField label="Install Guide Email" value={installGuideEmail} onChange={setInstallGuideEmail} placeholder="client@store.com" />
                    <TextareaField label="Install Guide Text" value={installGuideText} onChange={setInstallGuideText} rows={5} />
                    <button onClick={sendInstallGuide} disabled={saving} className="w-full rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 disabled:opacity-50 sm:w-auto">Send Install Guide</button>
                  </div>
                </Panel>

                <Panel title="Client Access">
                  <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                    <InputField label="Client Email" value={accountEmail} onChange={setAccountEmail} placeholder="client@store.com" />
                    <div className="flex items-end">
                      <button onClick={resetClientPassword} disabled={saving} className="w-full rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 disabled:opacity-50">Generate Temp Password</button>
                    </div>
                  </div>
                  {tempPassword ? <div className="mt-4 rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4 font-mono text-sm text-violet-100">{tempPassword}</div> : null}
                </Panel>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function InfoStat({ label, value }) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</div>
      <div className="mt-2 break-words text-sm font-bold text-white [overflow-wrap:anywhere]">{String(value ?? "Not set")}</div>
    </div>
  );
}
