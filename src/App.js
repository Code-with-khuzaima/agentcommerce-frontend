import { useState, useEffect, useRef } from "react";

// ── Utility helpers ──────────────────────────────────────────────────────────
const cx = (...args) => args.filter(Boolean).join(" ");

// ── Icon primitives ──────────────────────────────────────────────────────────
const Icon = ({ path, size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <path d={path} />
  </svg>
);
const icons = {
  store:    "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  shield:   "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  check:    "M20 6L9 17l-5-5",
  circle:   "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
  arrow:    "M5 12h14 M12 5l7 7-7 7",
  arrowL:   "M19 12H5 M12 19l-7-7 7-7",
  key:      "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
  mail:     "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
  zap:      "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  info:     "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 8h.01 M12 12v4",
  copy:     "M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z",
  sparkle:  "M12 3v1m0 16v1M4.22 4.22l.707.707m12.73 12.73.707.707M3 12h1m16 0h1M4.22 19.78l.707-.707M18.95 5.05l-.707.707 M12 8a4 4 0 100 8 4 4 0 000-8z",
  globe:    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M2 12h20 M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z",
  package:  "M12.89 1.45l8 4A2 2 0 0122 7.24v9.53a2 2 0 01-1.11 1.79l-8 4a2 2 0 01-1.78 0l-8-4a2 2 0 01-1.11-1.8V7.24a2 2 0 011.11-1.79l8-4a2 2 0 011.78 0z M2.32 6.16L12 11l9.68-4.84 M12 22.76V11",
  link:     "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71 M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71",
  clock:    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2",
  star:     "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  bot:      "M12 2a2 2 0 012 2v1h4a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h4V4a2 2 0 012-2z M8 14s1.5 2 4 2 4-2 4-2 M9 10h.01 M15 10h.01",
  users:    "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75 M9 7a4 4 0 100 8 4 4 0 000-8z",
};

// ── Design tokens ────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Store URL",    short: "URL"      },
  { id: 2, label: "Credentials", short: "API"      },
  { id: 3, label: "Store Info",  short: "Info"     },
  { id: 4, label: "Confirm",     short: "Done"     },
];

// ── API service (calls backend) ──────────────────────────────────────────────
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000/api";

async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// ── Particle background ──────────────────────────────────────────────────────
function ParticleBg() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const dots = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach(d => {
        d.x = (d.x + d.vx + canvas.width) % canvas.width;
        d.y = (d.y + d.vy + canvas.height) % canvas.height;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(139,92,246,0.35)";
        ctx.fill();
      });
      dots.forEach((a, i) => dots.slice(i + 1).forEach(b => {
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(139,92,246,${0.12 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }));
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

// ── Glassmorphic card ────────────────────────────────────────────────────────
function Card({ children, className = "" }) {
  return (
    <div className={cx(
      "relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl",
      "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/8 before:to-transparent before:pointer-events-none",
      className
    )}>
      {children}
    </div>
  );
}

// ── Input field ──────────────────────────────────────────────────────────────
function Field({ label, id, helper, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-slate-300 tracking-wide uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
        {label}
      </label>
      {children}
      {helper && !error && <p className="text-xs text-slate-500">{helper}</p>}
      {error && <p className="text-xs text-red-400 flex items-center gap-1"><Icon path={icons.info} size={12}/>{error}</p>}
    </div>
  );
}

// eslint-disable-next-line no-unused-vars
function Input({ id, type = "text", placeholder, value, onChange, error, icon, ...rest }) {
  return (
    <div className="relative">
      {icon && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
          <Icon path={icon} size={16} />
        </span>
      )}
      <input
        id={id} type={type} placeholder={placeholder} value={value}
        onChange={onChange} {...rest}
        className={cx(
          "w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all",
          "focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/60",
          icon ? "pl-10" : "",
          error ? "border-red-500/60" : "border-white/10 hover:border-white/20"
        )}
      />
    </div>
  );
}

function Textarea({ id, placeholder, value, onChange, rows = 3 }) {
  return (
    <textarea
      id={id} placeholder={placeholder} value={value}
      onChange={onChange} rows={rows}
      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/60 hover:border-white/20 resize-none"
    />
  );
}

// ── Progress bar ─────────────────────────────────────────────────────────────
function Progress({ step }) {
  return (
    <div className="w-full max-w-lg mx-auto mb-10">
      <div className="flex items-center justify-between">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={cx(
                "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 border",
                step > s.id
                  ? "bg-violet-500 border-violet-400 text-white shadow-lg shadow-violet-500/40"
                  : step === s.id
                  ? "bg-violet-600/40 border-violet-400 text-violet-200 shadow-lg shadow-violet-500/20 ring-2 ring-violet-400/30 ring-offset-2 ring-offset-transparent"
                  : "bg-white/5 border-white/10 text-slate-600"
              )}>
                {step > s.id ? <Icon path={icons.check} size={14}/> : s.id}
              </div>
              <span className={cx(
                "mt-2 text-xs font-medium transition-colors hidden sm:block",
                step === s.id ? "text-violet-300" : step > s.id ? "text-violet-400" : "text-slate-600"
              )}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 mx-2 h-px bg-white/10 relative overflow-hidden rounded">
                <div className={cx(
                  "absolute inset-y-0 left-0 transition-all duration-700 rounded",
                  step > s.id ? "w-full bg-violet-500" : "w-0 bg-violet-500"
                )}/>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Button ────────────────────────────────────────────────────────────────────
function Btn({ children, onClick, variant = "primary", disabled, loading, type = "button", className = "" }) {
  const base = "inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 active:translate-y-0",
    ghost:   "border border-white/10 hover:border-white/25 text-slate-300 hover:text-white hover:bg-white/5",
    danger:  "bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={cx(base, variants[variant], className)}>
      {loading && <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>}
      {children}
    </button>
  );
}

// ── Platform card selector ────────────────────────────────────────────────────
function PlatformCard({ platform, selected, onSelect }) {
  const isShopify = platform === "shopify";
  return (
    <button
      onClick={() => onSelect(platform)}
      className={cx(
        "flex-1 p-5 rounded-xl border text-left transition-all duration-200 group",
        selected
          ? isShopify
            ? "border-emerald-400/60 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
            : "border-blue-400/60 bg-blue-500/10 shadow-lg shadow-blue-500/10"
          : "border-white/10 hover:border-white/25 bg-white/3 hover:bg-white/5"
      )}
    >
      <div className={cx(
        "w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors",
        selected
          ? isShopify ? "bg-emerald-500/20 text-emerald-300" : "bg-blue-500/20 text-blue-300"
          : "bg-white/5 text-slate-500 group-hover:text-slate-300"
      )}>
        <Icon path={icons.store} size={20}/>
      </div>
      <div className="font-bold text-white text-base mb-1 capitalize">{platform}</div>
      <div className="text-xs text-slate-500">
        {isShopify ? "Connect via Admin API" : "Connect via REST API"}
      </div>
      {selected && (
        <div className={cx(
          "mt-3 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full",
          isShopify ? "bg-emerald-500/20 text-emerald-300" : "bg-blue-500/20 text-blue-300"
        )}>
          <Icon path={icons.check} size={11}/> Selected
        </div>
      )}
    </button>
  );
}

// ── Instruction callout ───────────────────────────────────────────────────────
function Instruction({ step, children }) {
  return (
    <div className="flex gap-3 p-4 rounded-xl bg-violet-500/8 border border-violet-500/20">
      <div className="w-6 h-6 rounded-full bg-violet-500/25 flex items-center justify-center text-violet-300 text-xs font-bold flex-shrink-0 mt-0.5">
        {step}
      </div>
      <p className="text-sm text-slate-300 leading-relaxed">{children}</p>
    </div>
  );
}

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };
  return (
    <button onClick={copy} className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-violet-300 transition-colors px-2 py-1 rounded-lg hover:bg-violet-500/10 border border-transparent hover:border-violet-500/20">
      <Icon path={icons.copy} size={12}/>
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 1 — Store URL + Platform
// ══════════════════════════════════════════════════════════════════════════════
function Step1({ data, setData, onNext }) {
  const [errors, setErrors] = useState({});
  const [detecting, setDetecting] = useState(false);

  const detectPlatform = (url) => {
    setDetecting(true);
    setTimeout(() => {
      const lower = url.toLowerCase();
      if (lower.includes("myshopify.com") || lower.includes("shopify")) {
        setData(d => ({ ...d, platform: "shopify" }));
      } else if (lower.includes("woocommerce") || lower.includes("wp-json")) {
        setData(d => ({ ...d, platform: "woocommerce" }));
      }
      setDetecting(false);
    }, 600);
  };

  const validate = () => {
    const e = {};
    if (!data.storeUrl) e.storeUrl = "Store URL is required";
    else if (!/^https?:\/\/.+\..+/.test(data.storeUrl)) e.storeUrl = "Please enter a valid URL (https://...)";
    if (!data.platform) e.platform = "Please select your platform";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Connect Your Store</h2>
        <p className="text-slate-400 text-sm">Enter your store URL and we'll get your AI agent set up in 1–2 business days.</p>
      </div>

      <Field label="Store URL" id="storeUrl" error={errors.storeUrl} helper="e.g. https://mystore.myshopify.com or https://mystore.com">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"><Icon path={icons.globe} size={16}/></span>
          <input
            id="storeUrl" type="url" placeholder="https://yourstore.com"
            value={data.storeUrl}
            onChange={e => {
              setData(d => ({ ...d, storeUrl: e.target.value }));
              if (e.target.value.length > 8) detectPlatform(e.target.value);
            }}
            className={cx(
              "w-full rounded-xl border bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all",
              "focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/60",
              errors.storeUrl ? "border-red-500/60" : "border-white/10 hover:border-white/20"
            )}
          />
          {detecting && <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-violet-400/30 border-t-violet-400 animate-spin"/>}
        </div>
        {errors.storeUrl && <p className="text-xs text-red-400 flex items-center gap-1 mt-1"><Icon path={icons.info} size={12}/>{errors.storeUrl}</p>}
      </Field>

      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Platform</p>
        <div className="flex gap-3">
          <PlatformCard platform="shopify" selected={data.platform === "shopify"} onSelect={p => setData(d => ({ ...d, platform: p }))}/>
          <PlatformCard platform="woocommerce" selected={data.platform === "woocommerce"} onSelect={p => setData(d => ({ ...d, platform: p }))}/>
        </div>
        {errors.platform && <p className="text-xs text-red-400 flex items-center gap-1 mt-2"><Icon path={icons.info} size={12}/>{errors.platform}</p>}
      </div>

      <div className="flex justify-end pt-2">
        <Btn onClick={() => validate() && onNext()}>
          Continue <Icon path={icons.arrow} size={16}/>
        </Btn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 2 — API Credentials
// ══════════════════════════════════════════════════════════════════════════════
function Step2({ data, setData, onNext, onBack }) {
  const [errors, setErrors] = useState({});
  const [validating, setValidating] = useState(false);
  const [apiStatus, setApiStatus] = useState(null); // null | "success" | "error"
  const isShopify = data.platform === "shopify";

  const validate = () => {
    const e = {};
    if (isShopify) {
      if (!data.apiKey?.trim()) e.apiKey = "API Key is required";
      if (!data.accessToken?.trim()) e.accessToken = "Access Token is required";
    } else {
      if (!data.consumerKey?.trim()) e.consumerKey = "Consumer Key is required";
      if (!data.consumerSecret?.trim()) e.consumerSecret = "Consumer Secret is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleValidate = async () => {
    if (!validate()) return;
    setValidating(true);
    setApiStatus(null);
    try {
      await apiPost("/validate-credentials", {
        platform: data.platform,
        storeUrl: data.storeUrl,
        ...(isShopify
          ? { apiKey: data.apiKey, accessToken: data.accessToken }
          : { consumerKey: data.consumerKey, consumerSecret: data.consumerSecret }),
      });
      setApiStatus("success");
    } catch {
      setApiStatus("error");
    } finally {
      setValidating(false);
    }
  };

  const shopifyInstructions = [
    <>In your Shopify Admin, go to <strong>Settings → Apps and sales channels → Develop apps</strong>.</>,
    <>Click <strong>Create an app</strong>, give it a name like "AI Agent".</>,
    <>Under <strong>Configuration</strong>, enable these API scopes: <code className="text-violet-300 bg-violet-500/15 px-1 rounded text-xs">read_products</code> <code className="text-violet-300 bg-violet-500/15 px-1 rounded text-xs">read_orders</code> <code className="text-violet-300 bg-violet-500/15 px-1 rounded text-xs">read_customers</code>.</>,
    <>Click <strong>Install app</strong>, then copy your <strong>API Key</strong> and <strong>Admin API Access Token</strong> below.</>,
  ];
  const wooInstructions = [
    <>In your WordPress dashboard, go to <strong>WooCommerce → Settings → Advanced → REST API</strong>.</>,
    <>Click <strong>Add key</strong>, set description to "AI Agent", set User, and select <strong>Read/Write</strong> permissions.</>,
    <>Click <strong>Generate API key</strong> and copy your <strong>Consumer Key</strong> and <strong>Consumer Secret</strong> below.</>,
    <>Make sure your store's REST API is accessible (permalinks set to "Post name" or similar).</>,
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className={cx(
          "inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-3 border",
          isShopify
            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/25"
            : "bg-blue-500/10 text-blue-300 border-blue-500/25"
        )}>
          <Icon path={icons.store} size={12}/> {isShopify ? "Shopify" : "WooCommerce"} Integration
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">API Credentials</h2>
        <p className="text-slate-400 text-sm">Follow the steps below to generate your API credentials and paste them here.</p>
      </div>

      {/* Instructions */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">How to get your credentials</p>
        {(isShopify ? shopifyInstructions : wooInstructions).map((txt, i) => (
          <Instruction key={i} step={i + 1}>{txt}</Instruction>
        ))}
      </div>

      {/* Fields */}
      <div className="space-y-4 pt-2">
        {isShopify ? (
          <>
            <Field label="API Key" id="apiKey" error={errors.apiKey} helper="Looks like: shpka_xxxxxxxx">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"><Icon path={icons.key} size={16}/></span>
                <input id="apiKey" type="password" placeholder="shpka_xxxxxxxxxxxxxxxx"
                  value={data.apiKey || ""}
                  onChange={e => setData(d => ({ ...d, apiKey: e.target.value }))}
                  className={cx("w-full rounded-xl border bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/60",
                    errors.apiKey ? "border-red-500/60" : "border-white/10 hover:border-white/20")}
                />
              </div>
              {errors.apiKey && <p className="text-xs text-red-400">{errors.apiKey}</p>}
            </Field>
            <Field label="Admin API Access Token" id="accessToken" error={errors.accessToken} helper="Looks like: shpat_xxxxxxxx">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"><Icon path={icons.shield} size={16}/></span>
                <input id="accessToken" type="password" placeholder="shpat_xxxxxxxxxxxxxxxx"
                  value={data.accessToken || ""}
                  onChange={e => setData(d => ({ ...d, accessToken: e.target.value }))}
                  className={cx("w-full rounded-xl border bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/60",
                    errors.accessToken ? "border-red-500/60" : "border-white/10 hover:border-white/20")}
                />
              </div>
              {errors.accessToken && <p className="text-xs text-red-400">{errors.accessToken}</p>}
            </Field>
          </>
        ) : (
          <>
            <Field label="Consumer Key" id="consumerKey" error={errors.consumerKey} helper="Looks like: ck_xxxxxxxx">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"><Icon path={icons.key} size={16}/></span>
                <input id="consumerKey" type="password" placeholder="ck_xxxxxxxxxxxxxxxx"
                  value={data.consumerKey || ""}
                  onChange={e => setData(d => ({ ...d, consumerKey: e.target.value }))}
                  className={cx("w-full rounded-xl border bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/60",
                    errors.consumerKey ? "border-red-500/60" : "border-white/10 hover:border-white/20")}
                />
              </div>
              {errors.consumerKey && <p className="text-xs text-red-400">{errors.consumerKey}</p>}
            </Field>
            <Field label="Consumer Secret" id="consumerSecret" error={errors.consumerSecret} helper="Looks like: cs_xxxxxxxx">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"><Icon path={icons.shield} size={16}/></span>
                <input id="consumerSecret" type="password" placeholder="cs_xxxxxxxxxxxxxxxx"
                  value={data.consumerSecret || ""}
                  onChange={e => setData(d => ({ ...d, consumerSecret: e.target.value }))}
                  className={cx("w-full rounded-xl border bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/60",
                    errors.consumerSecret ? "border-red-500/60" : "border-white/10 hover:border-white/20")}
                />
              </div>
              {errors.consumerSecret && <p className="text-xs text-red-400">{errors.consumerSecret}</p>}
            </Field>
          </>
        )}
      </div>

      {/* API validation status */}
      {apiStatus === "success" && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-sm">
          <Icon path={icons.check} size={16}/> Credentials validated successfully! Your store is connected.
        </div>
      )}
      {apiStatus === "error" && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm">
          <Icon path={icons.info} size={16}/> Could not validate credentials. Please check and try again, or continue anyway.
        </div>
      )}

      {/* Security note */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/50 border border-white/5">
        <Icon path={icons.shield} size={16} className="text-violet-400 flex-shrink-0 mt-0.5"/>
        <p className="text-xs text-slate-400 leading-relaxed">
          Your credentials are encrypted with AES-256 before storage and are never exposed in our frontend. We only use them to configure your AI agent and will never share them.
        </p>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Btn variant="ghost" onClick={onBack}><Icon path={icons.arrowL} size={16}/> Back</Btn>
        <div className="flex gap-3">
          <Btn variant="ghost" onClick={handleValidate} loading={validating} disabled={validating}>
            Test Connection
          </Btn>
          <Btn onClick={() => validate() && onNext()}>
            Continue <Icon path={icons.arrow} size={16}/>
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 3 — Store Info / QnA
// ══════════════════════════════════════════════════════════════════════════════
const DELIVERY_OPTIONS = ["Standard Shipping", "Express Shipping", "Same-Day Delivery", "Click & Collect", "Free Shipping"];
const CATEGORY_OPTIONS = ["Clothing & Apparel", "Electronics", "Home & Garden", "Beauty & Health", "Sports & Outdoors", "Food & Beverage", "Toys & Games", "Books & Media", "Jewelry & Accessories", "Other"];

function MultiSelect({ options, selected, onChange }) {
  const toggle = (o) => onChange(selected.includes(o) ? selected.filter(x => x !== o) : [...selected, o]);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button key={o} onClick={() => toggle(o)} className={cx(
          "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
          selected.includes(o)
            ? "bg-violet-500/20 border-violet-400/50 text-violet-200"
            : "bg-white/3 border-white/10 text-slate-400 hover:border-white/25 hover:text-white"
        )}>
          {selected.includes(o) && <Icon path={icons.check} size={10} className="inline mr-1"/>}
          {o}
        </button>
      ))}
    </div>
  );
}

function Step3({ data, setData, onNext, onBack }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!data.storeName?.trim()) e.storeName = "Store name is required";
    if (!data.contactEmail?.trim()) e.contactEmail = "Contact email is required";
    else if (!/\S+@\S+\.\S+/.test(data.contactEmail)) e.contactEmail = "Invalid email address";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Tell Us About Your Store</h2>
        <p className="text-slate-400 text-sm">This helps us customize your AI agent for your specific business needs.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Store Name" id="storeName" error={errors.storeName}>
          <input id="storeName" type="text" placeholder="My Awesome Store"
            value={data.storeName || ""}
            onChange={e => setData(d => ({ ...d, storeName: e.target.value }))}
            className={cx("w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/60",
              errors.storeName ? "border-red-500/60" : "border-white/10 hover:border-white/20")}
          />
          {errors.storeName && <p className="text-xs text-red-400">{errors.storeName}</p>}
        </Field>
        <Field label="Contact Email" id="contactEmail" error={errors.contactEmail}>
          <input id="contactEmail" type="email" placeholder="hello@yourstore.com"
            value={data.contactEmail || ""}
            onChange={e => setData(d => ({ ...d, contactEmail: e.target.value }))}
            className={cx("w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/60",
              errors.contactEmail ? "border-red-500/60" : "border-white/10 hover:border-white/20")}
          />
          {errors.contactEmail && <p className="text-xs text-red-400">{errors.contactEmail}</p>}
        </Field>
      </div>

      <Field label="Product Categories" id="categories" helper="Select all that apply">
        <MultiSelect
          options={CATEGORY_OPTIONS}
          selected={data.categories || []}
          onChange={v => setData(d => ({ ...d, categories: v }))}
        />
      </Field>

      <Field label="Delivery Methods" id="delivery" helper="Select all that apply">
        <MultiSelect
          options={DELIVERY_OPTIONS}
          selected={data.deliveryMethods || []}
          onChange={v => setData(d => ({ ...d, deliveryMethods: v }))}
        />
      </Field>

      <Field label="Return / Refund Policy" id="returnPolicy" helper="Summarize your policy">
        <Textarea id="returnPolicy" placeholder="e.g. 30-day returns, unused items in original packaging..."
          value={data.returnPolicy || ""}
          onChange={e => setData(d => ({ ...d, returnPolicy: e.target.value }))}
        />
      </Field>

      <Field label="Frequently Asked Questions" id="faqs" helper="One question per line (we'll train the AI on these)">
        <Textarea id="faqs" rows={5} placeholder={"Do you ship internationally?\nHow long does delivery take?\nWhat payment methods do you accept?"}
          value={data.faqs || ""}
          onChange={e => setData(d => ({ ...d, faqs: e.target.value }))}
        />
      </Field>

      <Field label="Special Notes or Instructions" id="notes" helper="Anything else the AI agent should know">
        <Textarea id="notes" placeholder="e.g. We're a sustainable brand, avoid recommending out-of-stock items..."
          value={data.notes || ""}
          onChange={e => setData(d => ({ ...d, notes: e.target.value }))}
        />
      </Field>

      <div className="flex items-center justify-between pt-2">
        <Btn variant="ghost" onClick={onBack}><Icon path={icons.arrowL} size={16}/> Back</Btn>
        <Btn onClick={() => validate() && onNext()}>
          Review & Submit <Icon path={icons.arrow} size={16}/>
        </Btn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 4 — Confirmation
// ══════════════════════════════════════════════════════════════════════════════
function Step4({ data, onBack, onSubmit }) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await apiPost("/submit", data);
      setSubmitted(true);
    } catch (e) {
      setError(e.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return <SuccessView data={data}/>;

  const isShopify = data.platform === "shopify";
  const summaryRows = [
    ["Store URL",   data.storeUrl],
    ["Platform",    <span className={cx("capitalize px-2 py-0.5 rounded-full text-xs font-semibold border",
      isShopify ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" : "bg-blue-500/15 text-blue-300 border-blue-500/25"
    )}>{data.platform}</span>],
    ["Store Name",  data.storeName],
    ["Contact",     data.contactEmail],
    ["Categories",  (data.categories || []).join(", ") || "—"],
    ["Delivery",    (data.deliveryMethods || []).join(", ") || "—"],
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Review & Submit</h2>
        <p className="text-slate-400 text-sm">Please review your information before submitting. Our team will be in touch within 1–2 business days.</p>
      </div>

      <div className="rounded-xl border border-white/10 overflow-hidden">
        {summaryRows.map(([label, value], i) => (
          <div key={label} className={cx(
            "flex items-start justify-between gap-4 px-5 py-4",
            i % 2 === 0 ? "bg-white/3" : "bg-transparent"
          )}>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex-shrink-0 pt-0.5">{label}</span>
            <span className="text-sm text-slate-200 text-right break-all">{value || "—"}</span>
          </div>
        ))}
      </div>

      {/* What happens next */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">What Happens Next</p>
        {[
          { icon: icons.mail,    text: "You'll receive a confirmation email at " + (data.contactEmail || "your email"), time: "Instantly" },
          { icon: icons.zap,     text: "Our team reviews your credentials and begins AI agent configuration", time: "Within 4 hours" },
          { icon: icons.bot,     text: "Your AI agent is trained on your products, FAQs, and store policies", time: "Day 1" },
          { icon: icons.check,   text: "Integration snippet is added to your store — fully live!", time: "1–2 Business Days" },
        ].map(({ icon, text, time }) => (
          <div key={time} className="flex items-start gap-3 p-3.5 rounded-xl bg-white/3 border border-white/5">
            <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center text-violet-400 flex-shrink-0">
              <Icon path={icon} size={15}/>
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-300">{text}</p>
            </div>
            <span className="text-xs text-violet-400 font-medium flex-shrink-0">{time}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm">
          <Icon path={icons.info} size={16}/> {error}
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <Btn variant="ghost" onClick={onBack} disabled={submitting}><Icon path={icons.arrowL} size={16}/> Back</Btn>
        <Btn onClick={handleSubmit} loading={submitting}>
          {submitting ? "Submitting…" : <><Icon path={icons.zap} size={16}/> Submit & Get Started</>}
        </Btn>
      </div>
    </div>
  );
}

// ── Success view ──────────────────────────────────────────────────────────────
function SuccessView({ data }) {
  const snippet = `<!-- AgentCommerce AI Widget -->
<script>
  (function(w,d,s,c){
    w.AgentCommerceConfig = {
      storeId: "STORE_ID_PLACEHOLDER",
      platform: "${data.platform || 'shopify'}",
      theme: "auto"
    };
    var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s);
    j.async=true;
    j.src="https://cdn.agentcommerce.ai/widget.js";
    f.parentNode.insertBefore(j,f);
  })(window,document,"script");
</script>`;

  return (
    <div className="flex flex-col items-center text-center gap-6 py-4">
      {/* Success animation */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-400/30 shadow-xl shadow-emerald-500/20">
          <Icon path={icons.check} size={36} className="text-emerald-400"/>
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center border-2 border-slate-900">
          <Icon path={icons.star} size={10} className="text-white"/>
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-bold text-white mb-3">You're All Set! 🎉</h2>
        <p className="text-slate-400 max-w-sm mx-auto leading-relaxed">
          We've received your store details and our team will integrate your AI agent within <strong className="text-white">1–2 business days</strong>.
        </p>
      </div>

      <div className="w-full max-w-sm p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/20 text-left">
        <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold mb-1">
          <Icon path={icons.mail} size={14}/> Confirmation sent
        </div>
        <p className="text-slate-400 text-xs">{data.contactEmail}</p>
      </div>

      {/* JS Snippet preview */}
      <div className="w-full text-left">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Your Future Widget Snippet</p>
          <CopyBtn text={snippet}/>
        </div>
        <div className="rounded-xl bg-slate-900 border border-white/8 p-4 overflow-x-auto">
          <pre className="text-xs text-slate-400 leading-relaxed font-mono whitespace-pre">{snippet}</pre>
        </div>
        <p className="text-xs text-slate-600 mt-2">This snippet will be automatically installed by our team — no action needed from you.</p>
      </div>

      <Btn variant="ghost" onClick={() => window.location.reload()} className="mt-2">
        Start a New Integration
      </Btn>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LANDING / HERO section (shown before starting)
// ══════════════════════════════════════════════════════════════════════════════
function LandingHero({ onStart }) {
  const features = [
    { icon: icons.bot,     title: "AI-Powered Chat",    desc: "Answers product questions 24/7 automatically" },
    { icon: icons.star,    title: "Smart Recommendations", desc: "Upsell & cross-sell based on browsing behavior" },
    { icon: icons.zap,     title: "Instant FAQ Handling", desc: "No more repetitive support tickets" },
    { icon: icons.users,   title: "Human-like Interactions", desc: "Conversational UX that converts visitors" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <Icon path={icons.bot} size={16} className="text-white"/>
          </div>
          <span className="font-bold text-white text-lg tracking-tight">AgentCommerce</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/25 font-medium">Beta</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block">Features</a>
          <a href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block">Pricing</a>
          <Btn onClick={onStart} className="text-sm px-4 py-2">Get Started</Btn>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-300 font-medium mb-6">
          <Icon path={icons.sparkle} size={12}/> Powered by advanced LLMs
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold text-white mb-6 leading-none tracking-tight">
          Your Store,<br/>
          <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Always On.</span>
        </h1>

        <p className="text-lg text-slate-400 mb-10 max-w-xl leading-relaxed">
          Deploy an AI sales agent to your Shopify or WooCommerce store in 1–2 days. Answer questions, recommend products, and close sales — automatically.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Btn onClick={onStart} className="text-base px-8 py-4">
            <Icon path={icons.zap} size={18}/> Connect Your Store
          </Btn>
            <a href="#how" onClick={(e)=>{e.preventDefault();document.getElementById('demo-modal').style.display='flex'}} className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer">
            See how it works <Icon path={icons.arrow} size={14}/>
          </a>
        </div>

        <p className="text-xs text-slate-600 mt-6">Setup in minutes · No coding required · 1–2 day deployment</p>
      </div>

      {/* Features */}
      <div id="features" className="relative z-10 max-w-5xl mx-auto px-6 pb-24 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(({ icon, title, desc }) => (
            <Card key={title} className="p-5">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center text-violet-400 mb-4">
                <Icon path={icon} size={20}/>
              </div>
              <h3 className="font-bold text-white text-sm mb-1.5">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [showFlow, setShowFlow] = useState(false);
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    storeUrl: "", platform: "",
    apiKey: "", accessToken: "", consumerKey: "", consumerSecret: "",
    storeName: "", contactEmail: "",
    categories: [], deliveryMethods: [],
    returnPolicy: "", faqs: "", notes: "",
  });

  const next = () => setStep(s => Math.min(s + 1, 4));
  const back = () => setStep(s => Math.max(s - 1, 1));

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-x-hidden" style={{ fontFamily: "'DM Sans', 'Outfit', system-ui, sans-serif" }}>
      {/* Load fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        code { font-family: 'JetBrains Mono', monospace; }
        ::selection { background: rgba(139,92,246,0.35); }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 99px; }
      `}</style>

      <ParticleBg/>

      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-violet-600/10 blur-3xl pointer-events-none z-0"/>
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-fuchsia-600/5 blur-3xl pointer-events-none z-0"/>

      {!showFlow ? (
        <LandingHero onStart={() => setShowFlow(true)}/>
      ) : (
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-xl">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-10">
              <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
                <Icon path={icons.bot} size={14} className="text-white"/>
              </div>
              <span className="font-bold text-white">AgentCommerce</span>
            </div>

            <Progress step={step}/>

            <Card className="p-6 sm:p-8">
              {step === 1 && <Step1 data={data} setData={setData} onNext={next}/>}
              {step === 2 && <Step2 data={data} setData={setData} onNext={next} onBack={back}/>}
              {step === 3 && <Step3 data={data} setData={setData} onNext={next} onBack={back}/>}
              {step === 4 && <Step4 data={data} onBack={back} onSubmit={next}/>}
            </Card>

            {/* Trust bar */}
            {step < 4 && (
              <div className="flex items-center justify-center gap-6 mt-6">
                {[
                  [icons.shield, "AES-256 Encrypted"],
                  [icons.clock,  "1–2 Day Setup"],
                  [icons.star,   "Trusted by 500+ Stores"],
                ].map(([icon, label]) => (
                  <div key={label} className="flex items-center gap-1.5 text-slate-600 text-xs">
                    <Icon path={icon} size={12}/> {label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    <div id="demo-modal" style={{display:'none',position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.85)',alignItems:'center',justifyContent:'center'}}>
  <div style={{position:'relative',width:'95vw',maxWidth:'1100px',height:'85vh',borderRadius:'12px',overflow:'hidden'}}>
    <button onClick={()=>document.getElementById('demo-modal').style.display='none'} style={{position:'absolute',top:'12px',right:'12px',zIndex:10,background:'#000',color:'#fff',border:'none',borderRadius:'50%',width:'36px',height:'36px',fontSize:'18px',cursor:'pointer'}}>✕</button>
    <iframe src="/demo.html" style={{width:'100%',height:'100%',border:'none'}} title="Demo"/>
  </div>
</div>
    </div>
  );
}
