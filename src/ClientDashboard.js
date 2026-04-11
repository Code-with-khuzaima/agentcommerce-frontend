import { useEffect, useState } from "react";
import { apiGetDashboard, apiUpdateDashboard } from "./api";

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
    rose: "border-rose-500/30 bg-rose-500/10 text-rose-200",
  };

  return <span className={cx("inline-flex items-center rounded-xl border px-3 py-1 text-xs font-semibold", tones[tone])}>{label}</span>;
}

function SectionCard({ title, description, action, children }) {
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

function MetricCard({ label, value, hint }) {
  return (
    <div className="rounded-[24px] border border-slate-800 bg-slate-950/80 p-5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</div>
      <div className="mt-3 text-2xl font-black text-white">{value}</div>
      <div className="mt-2 text-sm text-slate-400">{hint}</div>
    </div>
  );
}

function Field({ label, helper, children }) {
  return (
    <label className="block">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</div>
      {children}
      {helper ? <div className="mt-2 text-xs text-slate-500">{helper}</div> : null}
    </label>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#050816] p-4">
      <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{label}</div>
      <div className="mt-2 text-sm font-semibold text-white break-words">{value || "Not set"}</div>
    </div>
  );
}

function ChecklistItem({ done, label, detail }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#050816] p-4">
      <div className="flex items-center gap-3">
        <div className={cx("flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black", done ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-300")}>
          {done ? "OK" : "PENDING"}
        </div>
        <div>
          <div className="text-sm font-semibold text-white">{label}</div>
          {detail ? <div className="mt-1 text-xs text-slate-400">{detail}</div> : null}
        </div>
      </div>
    </div>
  );
}

function toFaqList(text) {
  return String(text || "")
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeForm(store) {
  return {
    storeName: store.storeName || "",
    phoneNumber: store.phoneNumber || "",
    hasPhysicalStore: Boolean(store.hasPhysicalStore),
    storeAddress: store.storeAddress || "",
    agentName: store.agentName || "",
    accentColor: store.accentColor || "#7c3aed",
    welcomeMessage: store.welcomeMessage || "",
    categories: Array.isArray(store.categories) ? store.categories.join(", ") : "",
    deliveryMethods: Array.isArray(store.deliveryMethods) ? store.deliveryMethods.join(", ") : "",
    returnPolicy: store.returnPolicy || "",
    faqs: store.faqs || "",
    notes: store.notes || "",
    receiveLeads: store.storeAnswers?.receiveLeads === "yes",
  };
}

function parseCsv(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function ClientDashboard({ onLogout }) {
  const [data, setData] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [section, setSection] = useState("overview");

  useEffect(() => {
    apiGetDashboard()
      .then((response) => {
        setData(response);
        setForm(normalizeForm(response.store || {}));
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

  async function saveClientSettings() {
    if (!form) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        storeName: form.storeName.trim(),        phoneNumber: form.phoneNumber.trim(),
        hasPhysicalStore: !!form.hasPhysicalStore,
        storeAddress: form.hasPhysicalStore ? form.storeAddress.trim() : "",
        agentName: form.agentName.trim(),
        accentColor: form.accentColor.trim(),
        welcomeMessage: form.welcomeMessage.trim(),
        categories: parseCsv(form.categories),
        deliveryMethods: parseCsv(form.deliveryMethods),
        returnPolicy: form.returnPolicy.trim(),
        faqs: form.faqs.trim(),
        notes: form.notes.trim(),
        storeAnswers: {
          ...(data?.store?.storeAnswers || {}),
          receiveLeads: form.receiveLeads ? "yes" : "no",
          physicalStore: form.hasPhysicalStore ? "yes" : "no",
        },
      };
      const response = await apiUpdateDashboard(payload);
      setData((current) => ({ ...current, store: response.store }));
      setForm(normalizeForm(response.store));
      setSuccess("Dashboard settings updated.");
    } catch (err) {
      setError(err.message || "Failed to update dashboard settings.");
    } finally {
      setSaving(false);
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

  if (error && !data) {
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
  const msgCount = Number(store.msgCount || 0);
  const msgLimit = Number(store.msgLimit || 5000);
  const usagePercent = msgLimit >= 999999 ? 0 : Math.min(Math.round((msgCount / Math.max(msgLimit, 1)) * 100), 100);
  const usageRemaining = msgLimit >= 999999 ? "Unlimited" : `${Math.max(msgLimit - msgCount, 0).toLocaleString()} remaining`;
  const planLabels = { starter: "$19/mo", pro: "$29/mo", enterprise: "$49/mo" };
  const storeAnswers = store.storeAnswers || {};
  const installGuideSent = Boolean(store.installGuideSentAt);
  const workflowReady = ["ready", "live"].includes(store.workflowStatus);
  const widgetReady = ["ready", "live"].includes(store.widgetStatus);
  const setupLive = store.setupStatus === "live";

  const metrics = [
    ["Plan", formatLabel(plan), planLabels[plan]],
    ["Messages Used", msgCount.toLocaleString(), usageRemaining],
    ["Setup", formatLabel(store.setupStatus || "new"), formatLabel(store.workflowStatus || "not_started")],
    ["Widget", formatLabel(store.widgetStatus || "not_installed"), formatLabel(store.platform || "unknown")],
  ];

  const navItems = [
    ["overview", "Overview"],
    ["assistant", "Assistant Settings"],
    ["branding", "Branding"],
    ["store", "Store Info"],
    ["knowledge", "Knowledge Base"],
    ["support", "Support"],
  ];

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[36px] border border-slate-800 bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.18),_transparent_30%),linear-gradient(180deg,rgba(2,6,23,0.96),rgba(2,6,23,1))] shadow-[0_40px_120px_rgba(2,6,23,0.82)]">
          <header className="border-b border-slate-800 px-5 py-5 sm:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-300">Client Dashboard</div>
                <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">{store.storeName || "Your Store"} dashboard</h1>
                <p className="mt-2 max-w-3xl text-sm text-slate-400">Manage your assistant branding and store content from one place. Installation is handled by our team after setup review.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge tone="violet" label={`${formatLabel(plan)} - ${planLabels[plan]}`} />
                <StatusBadge tone="blue" label={data?.user?.email || "No email"} />
                <button onClick={saveClientSettings} disabled={saving || !form} className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950 disabled:opacity-50">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button onClick={handleLogout} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
                  Log Out
                </button>
              </div>
            </div>
            {error ? <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div> : null}
            {success ? <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{success}</div> : null}
            <div className="mt-4 rounded-2xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm text-violet-100">
              You receive your install guide in 1 to 2 days by email after internal setup review.
            </div>
          </header>

          <div className="px-5 py-5 sm:px-8">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {metrics.map(([label, value, hint]) => (
                <MetricCard key={label} label={label} value={value} hint={hint} />
              ))}
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[270px_minmax(0,1fr)]">
              <aside className="rounded-[28px] border border-slate-800 bg-slate-950/80 p-4">
                <div className="border-b border-slate-800 pb-4">
                  <div className="text-sm font-bold text-white">Workspace</div>
                  <div className="mt-1 text-sm text-slate-400">Use the sections below to manage the live store configuration.</div>
                </div>
                <div className="mt-4 space-y-2">
                  {navItems.map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setSection(key)}
                      className={cx(
                        "w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition",
                        section === key ? "bg-white text-slate-950" : "border border-slate-800 bg-[#050816] text-slate-300 hover:border-slate-700 hover:text-white"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl border border-slate-800 bg-[#050816] p-4">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Usage this cycle</div>
                  <div className="mt-3 h-2 rounded-full bg-slate-800">
                    <div className={cx("h-2 rounded-full", usagePercent > 80 ? "bg-amber-400" : "bg-gradient-to-r from-violet-500 to-sky-400")} style={{ width: `${Math.max(usagePercent, 4)}%` }} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>{msgCount.toLocaleString()} used</span>
                    <span>{usageRemaining}</span>
                  </div>
                </div>
              </aside>

              <main className="space-y-6">
                {section === "overview" ? (
                  <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                    <SectionCard title="Store snapshot" description="Current status of your account, setup, and storefront configuration.">
                      <div className="grid gap-4 md:grid-cols-2">
                        <InfoRow label="Store Name" value={store.storeName} />
                        <InfoRow label="Store URL" value={store.storeUrl} />
                        <InfoRow label="Platform" value={formatLabel(store.platform)} />
                        <InfoRow label="Store ID" value={store.storeId} />
                        <InfoRow label="Setup Status" value={formatLabel(store.setupStatus)} />
                        <InfoRow label="Workflow Status" value={formatLabel(store.workflowStatus)} />
                        <InfoRow label="Widget Status" value={formatLabel(store.widgetStatus)} />
                        <InfoRow label="Lead Capture" value={storeAnswers.receiveLeads === "yes" ? "Enabled" : "Disabled"} />
                      </div>
                    </SectionCard>

                    <SectionCard title="Account summary" description="Current commercial state of the account.">
                      <div className="grid gap-4">
                        <InfoRow label="Plan" value={`${formatLabel(plan)} - ${planLabels[plan]}`} />
                        <InfoRow label="Payment Status" value={formatLabel(store.paymentStatus || "pending")} />
                        <InfoRow label="Messages Used" value={`${msgCount.toLocaleString()} / ${msgLimit >= 999999 ? "Unlimited" : msgLimit.toLocaleString()}`} />
                        <InfoRow label="Last Activity" value={store.lastActiveAt ? new Date(store.lastActiveAt).toLocaleString() : "Not available"} />
                      </div>
                    </SectionCard>

                    <SectionCard title="Client Checklist" description="This tells you what the team has already finished and what is still pending before the assistant is fully live.">
                      <div className="grid gap-4 md:grid-cols-2">
                        <ChecklistItem done={workflowReady} label="Workflow ready" detail={workflowReady ? "The automation workflow is assigned and ready." : "Our team is still preparing or testing the workflow."} />
                        <ChecklistItem done={widgetReady} label="Widget ready" detail={widgetReady ? "The widget is marked ready for store installation." : "The widget is not marked ready yet."} />
                        <ChecklistItem done={installGuideSent} label="Install guide sent" detail={installGuideSent ? `Sent on ${new Date(store.installGuideSentAt).toLocaleString()}` : "You will receive installation details by email after internal QA."} />
                        <ChecklistItem done={setupLive} label="Store live" detail={setupLive ? "The store is marked live in our system." : "Setup is not marked live yet."} />
                      </div>
                    </SectionCard>
                  </div>
                ) : null}

                {section === "assistant" ? (
                  <SectionCard title="Assistant Settings" description="Edit the assistant identity and the welcome copy shown to visitors.">
                    <div className="grid gap-4 lg:grid-cols-2">
                      <Field label="AI Agent Name">
                        <input value={form.agentName} onChange={(event) => setForm((current) => ({ ...current, agentName: event.target.value }))} className="w-full rounded-2xl border border-slate-800 bg-[#050816] px-4 py-3 text-sm text-white outline-none" placeholder="Store Assistant" />
                      </Field>
                      <Field label="Lead Capture">
                        <div className="flex gap-3">
                          <button onClick={() => setForm((current) => ({ ...current, receiveLeads: true }))} className={cx("rounded-xl px-4 py-3 text-sm font-semibold", form.receiveLeads ? "bg-emerald-500 text-white" : "border border-slate-800 bg-[#050816] text-slate-300")}>Enabled</button>
                          <button onClick={() => setForm((current) => ({ ...current, receiveLeads: false }))} className={cx("rounded-xl px-4 py-3 text-sm font-semibold", !form.receiveLeads ? "bg-rose-500 text-white" : "border border-slate-800 bg-[#050816] text-slate-300")}>Disabled</button>
                        </div>
                      </Field>
                    </div>
                    <div className="mt-4">
                      <Field label="Welcome Text" helper="This appears when the chat opens for a new visitor.">
                        <textarea value={form.welcomeMessage} onChange={(event) => setForm((current) => ({ ...current, welcomeMessage: event.target.value }))} rows={4} className="w-full rounded-2xl border border-slate-800 bg-[#050816] px-4 py-3 text-sm text-white outline-none" placeholder="Hi, how can I help you today?" />
                      </Field>
                    </div>
                  </SectionCard>
                ) : null}

                {section === "branding" ? (
                  <SectionCard title="Branding" description="Manage the visual settings used by your live widget. Changes apply after save and sync.">
                    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                      <div className="rounded-[28px] border border-slate-800 bg-[#050816] p-5">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Widget preview</div>
                        <div className="mt-5 rounded-[24px] border border-slate-800 bg-slate-950 p-5">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full" style={{ backgroundColor: form.accentColor || "#7c3aed" }} />
                            <div>
                              <div className="text-sm font-bold text-white">{form.agentName || "Store Assistant"}</div>
                              <div className="text-xs text-slate-500">{store.storeName || "Your Store"}</div>
                            </div>
                          </div>
                          <div className="mt-4 rounded-2xl bg-slate-900 p-4 text-sm leading-6 text-slate-200">
                            {form.welcomeMessage || "Hi! How can I help you today?"}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Field label="Accent Color" helper="Use a hex color such as #7c3aed.">
                          <div className="flex gap-3">
                            <input value={form.accentColor} onChange={(event) => setForm((current) => ({ ...current, accentColor: event.target.value }))} className="w-full rounded-2xl border border-slate-800 bg-[#050816] px-4 py-3 text-sm text-white outline-none" placeholder="#7c3aed" />
                            <div className="h-12 w-12 shrink-0 rounded-2xl border border-slate-800" style={{ backgroundColor: form.accentColor || "#7c3aed" }} />
                          </div>
                        </Field>
                      </div>
                    </div>
                  </SectionCard>
                ) : null}

                {section === "store" ? (
                  <SectionCard title="Store Info" description="Update business details used in setup, support, and widget context.">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Store Name">
                        <input value={form.storeName} onChange={(event) => setForm((current) => ({ ...current, storeName: event.target.value }))} className="w-full rounded-2xl border border-slate-800 bg-[#050816] px-4 py-3 text-sm text-white outline-none" />
                      </Field>
                      <InfoRow label="Store Contact Email" value={store.contactEmail || "Not set"} />

                      <Field label="Phone Number">
                        <input value={form.phoneNumber} onChange={(event) => setForm((current) => ({ ...current, phoneNumber: event.target.value }))} className="w-full rounded-2xl border border-slate-800 bg-[#050816] px-4 py-3 text-sm text-white outline-none" />
                      </Field>
                      <Field label="Physical Store">
                        <div className="flex gap-3">
                          <button onClick={() => setForm((current) => ({ ...current, hasPhysicalStore: true }))} className={cx("rounded-xl px-4 py-3 text-sm font-semibold", form.hasPhysicalStore ? "bg-emerald-500 text-white" : "border border-slate-800 bg-[#050816] text-slate-300")}>Yes</button>
                          <button onClick={() => setForm((current) => ({ ...current, hasPhysicalStore: false, storeAddress: "" }))} className={cx("rounded-xl px-4 py-3 text-sm font-semibold", !form.hasPhysicalStore ? "bg-rose-500 text-white" : "border border-slate-800 bg-[#050816] text-slate-300")}>No</button>
                        </div>
                      </Field>
                    </div>
                    {form.hasPhysicalStore ? (
                      <div className="mt-4">
                        <Field label="Address">
                          <input value={form.storeAddress} onChange={(event) => setForm((current) => ({ ...current, storeAddress: event.target.value }))} className="w-full rounded-2xl border border-slate-800 bg-[#050816] px-4 py-3 text-sm text-white outline-none" />
                        </Field>
                      </div>
                    ) : null}
                    <div className="mt-4 grid gap-4">
                      <Field label="Categories" helper="Separate categories with commas.">
                        <input value={form.categories} onChange={(event) => setForm((current) => ({ ...current, categories: event.target.value }))} className="w-full rounded-2xl border border-slate-800 bg-[#050816] px-4 py-3 text-sm text-white outline-none" placeholder="Fashion, Sneakers, Accessories" />
                      </Field>
                      <Field label="Delivery Methods" helper="Separate methods with commas.">
                        <input value={form.deliveryMethods} onChange={(event) => setForm((current) => ({ ...current, deliveryMethods: event.target.value }))} className="w-full rounded-2xl border border-slate-800 bg-[#050816] px-4 py-3 text-sm text-white outline-none" placeholder="Courier, Local Delivery, Pickup" />
                      </Field>
                      <Field label="Return Policy">
                        <textarea value={form.returnPolicy} onChange={(event) => setForm((current) => ({ ...current, returnPolicy: event.target.value }))} rows={4} className="w-full rounded-2xl border border-slate-800 bg-[#050816] px-4 py-3 text-sm text-white outline-none" />
                      </Field>
                    </div>
                  </SectionCard>
                ) : null}

                {section === "knowledge" ? (
                  <SectionCard title="Knowledge Base" description="Edit the Q&A and notes used to support training and store context.">
                    <div className="grid gap-4">
                      <Field label="FAQs / Q&A" helper="Use one line per Q&A or paste your current training notes block.">
                        <textarea value={form.faqs} onChange={(event) => setForm((current) => ({ ...current, faqs: event.target.value }))} rows={10} className="w-full rounded-2xl border border-slate-800 bg-[#050816] px-4 py-3 text-sm text-white outline-none" placeholder="Shipping time: 3-5 business days" />
                      </Field>
                      <Field label="Store Notes" helper="Internal notes, delivery details, promotions, and anything useful for configuration.">
                        <textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} rows={6} className="w-full rounded-2xl border border-slate-800 bg-[#050816] px-4 py-3 text-sm text-white outline-none" />
                      </Field>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      <InfoRow label="Q&A Entries" value={String(toFaqList(form.faqs).length)} />
                      <InfoRow label="Categories" value={String(parseCsv(form.categories).length)} />
                      <InfoRow label="Lead Capture" value={form.receiveLeads ? "Enabled" : "Disabled"} />
                    </div>
                  </SectionCard>
                ) : null}

                {section === "support" ? (
                  <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
                    <SectionCard title="Support" description="Use these references when contacting support. Installation and final setup details are sent manually after review.">
                      <div className="grid gap-4 md:grid-cols-2">
                        <InfoRow label="Support Email" value="agentcomrce@gmail.com" />
                        <InfoRow label="Dashboard Email" value={data?.user?.email || "Not set"} />
                        <InfoRow label="Store Name" value={store.storeName} />
                        <InfoRow label="Store ID" value={store.storeId} />
                      </div>
                      <div className="mt-4 rounded-2xl border border-slate-800 bg-[#050816] p-4">
                        <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Client Steps</div>
                        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-300">
                          <li>Wait for the install guide email from our team.</li>
                          <li>Install the widget using the exact steps sent in that guide.</li>
                          <li>Refresh your store and send one test message.</li>
                          <li>Edit branding, FAQs, delivery, and policies here when needed.</li>
                          <li>Save changes in the dashboard so the next chat uses the new data.</li>
                        </ol>
                      </div>
                    </SectionCard>
                    <SectionCard title="Operational Snapshot" description="Useful support context from the current account state.">
                      <div className="grid gap-4">
                        <InfoRow label="Current Plan" value={`${formatLabel(plan)} - ${planLabels[plan]}`} />
                        <InfoRow label="Setup Stage" value={formatLabel(store.setupStatus || "new")} />
                        <InfoRow label="Widget Stage" value={formatLabel(store.widgetStatus || "not_installed")} />
                        <InfoRow label="Last Sync" value={store.lastSyncedAt ? new Date(store.lastSyncedAt).toLocaleString() : "Not available"} />
                      </div>
                      <div className="mt-4 rounded-2xl border border-slate-800 bg-[#050816] p-4 text-sm leading-6 text-slate-300">
                        Installation details are sent manually after internal QA. Typical setup time is 1 to 2 days.
                      </div>
                      {store.installGuide ? (
                        <div className="mt-4 rounded-2xl border border-slate-800 bg-[#050816] p-4">
                          <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Latest Install Guide</div>
                          <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">{store.installGuide}</div>
                          {store.installGuideSentAt ? <div className="mt-3 text-xs text-slate-500">Sent: {new Date(store.installGuideSentAt).toLocaleString()}</div> : null}
                        </div>
                      ) : null}
                    </SectionCard>
                  </div>
                ) : null}
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}






