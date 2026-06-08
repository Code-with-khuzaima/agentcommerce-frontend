import { useEffect, useMemo, useState } from "react";
import { API_BASE, apiGetDashboard } from "./api";

const cx = (...values) => values.filter(Boolean).join(" ");

function formatLabel(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function StatusBadge({ children, tone = "slate" }) {
  const tones = {
    slate: "border-slate-700 bg-slate-900 text-slate-300",
    emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    violet: "border-violet-500/30 bg-violet-500/10 text-violet-200",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  };

  return (
    <span className={cx("inline-flex max-w-full items-center rounded-xl border px-3 py-1 text-xs font-semibold", tones[tone])}>
      {children}
    </span>
  );
}

function InfoTile({ label, value }) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</div>
      <div className="mt-2 break-words text-sm font-semibold text-white [overflow-wrap:anywhere]">{value || "Not set"}</div>
    </div>
  );
}

function Step({ number, title, detail }) {
  return (
    <div className="grid min-w-0 gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:grid-cols-[40px_minmax(0,1fr)]">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-black text-slate-950 sm:h-10 sm:w-10">{number}</div>
      <div className="min-w-0">
        <div className="text-sm font-bold text-white">{title}</div>
        <div className="mt-1 text-sm leading-6 text-slate-400">{detail}</div>
      </div>
    </div>
  );
}

function CodeBlock({ code, copied, onCopy }) {
  return (
    <div className="min-w-0 rounded-[24px] border border-slate-800 bg-slate-950">
      <div className="flex flex-col gap-3 border-b border-slate-800 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="text-sm font-bold text-white">Widget integration code</div>
          <div className="mt-1 text-xs text-slate-500">Copy this full snippet and paste it once in your store.</div>
        </div>
        <button
          onClick={onCopy}
          className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950 sm:w-auto"
          type="button"
        >
          {copied ? "Copied" : "Copy Code"}
        </button>
      </div>
      <pre className="max-h-[420px] min-w-0 overflow-x-hidden whitespace-pre-wrap break-words p-4 text-xs leading-6 text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
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

export default function ClientDashboard({ onLogout }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const response = await apiGetDashboard();
        if (!cancelled) setData(response);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load dashboard.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem("ac_token");
    localStorage.removeItem("ac_user");
    onLogout();
  }

  const store = useMemo(() => data?.store || {}, [data]);
  const snippet = useMemo(() => buildWidgetSnippet(store), [store]);
  const platform = store.platform || "shopify";
  const platformLabel = platform === "woocommerce" ? "WooCommerce" : platform === "shopify" ? "Shopify" : formatLabel(platform);
  const isWooCommerce = platform === "woocommerce";
  const installTitle = isWooCommerce ? "WooCommerce paste method" : "Shopify paste method";
  const installSubtitle = isWooCommerce ? "Follow these WordPress/WooCommerce steps for your store." : "Follow these Shopify steps for your store.";
  const installBadge = isWooCommerce ? "WooCommerce" : "Shopify";
  const installSteps = isWooCommerce
    ? [
        ["1", "Open WordPress admin", "Go to your WordPress dashboard."],
        ["2", "Use a code plugin", "Open your site-wide header/footer code plugin, or Appearance theme editor if you manage code directly."],
        ["3", "Choose footer area", "Select the site-wide footer/body-end area."],
        ["4", "Paste and save", "Paste the copied widget code once, save, then refresh your storefront."],
      ]
    : [
        ["1", "Open Shopify admin", "Go to Online Store, then Themes."],
        ["2", "Edit code", "Open your current theme menu and choose Edit code."],
        ["3", "Open theme layout", "Find layout/theme.liquid."],
        ["4", "Paste before body end", "Paste the copied widget code just before the closing </body> tag, then save."],
      ];

  async function copySnippet() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
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
        <div className="max-w-md rounded-[28px] border border-slate-800 bg-slate-950 p-8 text-center">
          <p className="text-sm text-rose-300">{error}</p>
          <button onClick={handleLogout} className="mt-5 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050816] text-white">
      <div className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <header className="rounded-[28px] border border-slate-800 bg-slate-950 p-5 sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-300">Client Install</div>
              <h1 className="mt-2 break-words text-2xl font-black text-white sm:text-4xl">{store.storeName || "Your Store"}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                Copy the integration code below and paste it into your {platformLabel} store. This page is intentionally simple so clients do not edit setup data by mistake.
              </p>
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-3">
              <StatusBadge tone="violet">{platformLabel}</StatusBadge>
              <StatusBadge tone={store.storeId ? "emerald" : "amber"}>{store.storeId || "Store ID pending"}</StatusBadge>
              <button onClick={handleLogout} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
                Log Out
              </button>
            </div>
          </div>
        </header>

        <main className="mt-6 grid gap-6">
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoTile label="Store URL" value={store.storeUrl} />
            <InfoTile label="Login Email" value={data?.user?.email} />
            <InfoTile label="Plan" value={formatLabel(store.plan || "starter")} />
            <InfoTile label="Support" value="agentcomrce@gmail.com" />
          </section>

          <CodeBlock code={snippet} copied={copied} onCopy={copySnippet} />

          <section className="min-w-0 rounded-[28px] border border-slate-800 bg-slate-950/80 p-4 sm:p-5">
            <div className="flex flex-col gap-3 border-b border-slate-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-white">{installTitle}</h2>
                <p className="mt-1 text-sm text-slate-400">{installSubtitle}</p>
              </div>
              <StatusBadge>{installBadge}</StatusBadge>
            </div>
            <div className="mt-5 grid gap-3">
              {installSteps.map(([number, title, detail]) => (
                <Step key={number} number={number} title={title} detail={detail} />
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-violet-500/30 bg-violet-500/10 p-5">
            <h2 className="text-lg font-bold text-white">After pasting</h2>
            <div className="mt-3 grid gap-3 text-sm leading-6 text-violet-100 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">Open your storefront in a new browser tab.</div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">Check that the chat widget appears.</div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">Send one test message. If it fails, email support with your store ID.</div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
