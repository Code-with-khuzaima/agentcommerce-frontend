import { useState, useEffect, useRef } from "react";

const cx = (...args) => args.filter(Boolean).join(" ");

const Icon = ({ path, size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <path d={path} />
  </svg>
);

const icons = {
  store:   "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  shield:  "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  check:   "M20 6L9 17l-5-5",
  arrow:   "M5 12h14 M12 5l7 7-7 7",
  arrowL:  "M19 12H5 M12 19l-7-7 7-7",
  key:     "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
  mail:    "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
  zap:     "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  info:    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 8h.01 M12 12v4",
  copy:    "M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z",
  sparkle: "M12 3v1m0 16v1M4.22 4.22l.707.707m12.73 12.73.707.707M3 12h1m16 0h1M4.22 19.78l.707-.707M18.95 5.05l-.707.707 M12 8a4 4 0 100 8 4 4 0 000-8z",
  globe:   "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M2 12h20 M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z",
  bot:     "M12 2a2 2 0 012 2v1h4a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h4V4a2 2 0 012-2z M8 14s1.5 2 4 2 4-2 4-2 M9 10h.01 M15 10h.01",
  users:   "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75 M9 7a4 4 0 100 8 4 4 0 000-8z",
  star:    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  clock:   "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2",
  msg:     "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  trending:"M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
  package: "M12.89 1.45l8 4A2 2 0 0122 7.24v9.53a2 2 0 01-1.11 1.79l-8 4a2 2 0 01-1.78 0l-8-4a2 2 0 01-1.11-1.8V7.24a2 2 0 011.11-1.79l8-4a2 2 0 011.78 0z",
  phone:   "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z",
  refresh: "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  lock:    "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z M7 11V7a5 5 0 0110 0v4",
  chart:   "M18 20V10 M12 20V4 M6 20v-6",
};

const STEPS = [
  { id: 1, label: "Store URL" },
  { id: 2, label: "Credentials" },
  { id: 3, label: "Store Info" },
  { id: 4, label: "Confirm" },
];

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
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach(d => {
        d.x = (d.x + d.vx + canvas.width) % canvas.width;
        d.y = (d.y + d.vy + canvas.height) % canvas.height;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(139,92,246,0.35)"; ctx.fill();
      });
      dots.forEach((a, i) => dots.slice(i + 1).forEach(b => {
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 120) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(139,92,246,${0.12 * (1 - dist / 120)})`; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }));
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

function Card({ children, className = "" }) {
  return (
    <div className={cx("relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl", className)}>
      {children}
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", disabled, loading, type = "button", className = "" }) {
  const base = "inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 active:translate-y-0",
    ghost: "border border-white/10 hover:border-white/25 text-slate-300 hover:text-white hover:bg-white/5",
    white: "bg-white text-slate-900 hover:bg-slate-100 font-bold shadow-lg hover:-translate-y-0.5",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={cx(base, variants[variant], className)}>
      {loading && <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
      {children}
    </button>
  );
}

function Progress({ step }) {
  return (
    <div className="w-full max-w-lg mx-auto mb-10">
      <div className="flex items-center justify-between">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={cx("w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 border",
                step > s.id ? "bg-violet-500 border-violet-400 text-white shadow-lg shadow-violet-500/40"
                  : step === s.id ? "bg-violet-600/40 border-violet-400 text-violet-200 ring-2 ring-violet-400/30 ring-offset-2 ring-offset-transparent"
                    : "bg-white/5 border-white/10 text-slate-600")}>
                {step > s.id ? <Icon path={icons.check} size={14} /> : s.id}
              </div>
              <span className={cx("mt-2 text-xs font-medium hidden sm:block", step === s.id ? "text-violet-300" : step > s.id ? "text-violet-400" : "text-slate-600")}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 mx-2 h-px bg-white/10 relative overflow-hidden rounded">
                <div className={cx("absolute inset-y-0 left-0 transition-all duration-700 rounded", step > s.id ? "w-full bg-violet-500" : "w-0")} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PlatformCard({ platform, selected, onSelect }) {
  const isShopify = platform === "shopify";
  return (
    <button onClick={() => onSelect(platform)} className={cx("flex-1 p-5 rounded-xl border text-left transition-all duration-200 group",
      selected ? isShopify ? "border-emerald-400/60 bg-emerald-500/10" : "border-blue-400/60 bg-blue-500/10"
        : "border-white/10 hover:border-white/25 bg-white/3 hover:bg-white/5")}>
      <div className={cx("w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors",
        selected ? isShopify ? "bg-emerald-500/20 text-emerald-300" : "bg-blue-500/20 text-blue-300" : "bg-white/5 text-slate-500 group-hover:text-slate-300")}>
        <Icon path={icons.store} size={20} />
      </div>
      <div className="font-bold text-white text-base mb-1 capitalize">{platform}</div>
      <div className="text-xs text-slate-500">{isShopify ? "Connect via Admin API" : "Connect via REST API"}</div>
      {selected && <div className={cx("mt-3 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full", isShopify ? "bg-emerald-500/20 text-emerald-300" : "bg-blue-500/20 text-blue-300")}><Icon path={icons.check} size={11} /> Selected</div>}
    </button>
  );
}

function Instruction({ step, children }) {
  return (
    <div className="flex gap-3 p-4 rounded-xl bg-violet-500/8 border border-violet-500/20">
      <div className="w-6 h-6 rounded-full bg-violet-500/25 flex items-center justify-center text-violet-300 text-xs font-bold flex-shrink-0 mt-0.5">{step}</div>
      <p className="text-sm text-slate-300 leading-relaxed">{children}</p>
    </div>
  );
}

function Field({ label, id, helper, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</label>
      {children}
      {helper && !error && <p className="text-xs text-slate-500">{helper}</p>}
      {error && <p className="text-xs text-red-400 flex items-center gap-1"><Icon path={icons.info} size={12} />{error}</p>}
    </div>
  );
}

function Textarea({ id, placeholder, value, onChange, rows = 3 }) {
  return (
    <textarea id={id} placeholder={placeholder} value={value} onChange={onChange} rows={rows}
      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/60 hover:border-white/20 resize-none" />
  );
}

const DELIVERY_OPTIONS = ["Standard Shipping", "Express Shipping", "Same-Day Delivery", "Click & Collect", "Free Shipping"];
const CATEGORY_OPTIONS = ["Clothing & Apparel", "Electronics", "Home & Garden", "Beauty & Health", "Sports & Outdoors", "Food & Beverage", "Toys & Games", "Books & Media", "Jewelry & Accessories", "Other"];

function MultiSelect({ options, selected, onChange }) {
  const toggle = (o) => onChange(selected.includes(o) ? selected.filter(x => x !== o) : [...selected, o]);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button key={o} onClick={() => toggle(o)} className={cx("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
          selected.includes(o) ? "bg-violet-500/20 border-violet-400/50 text-violet-200" : "bg-white/3 border-white/10 text-slate-400 hover:border-white/25 hover:text-white")}>
          {selected.includes(o) && <Icon path={icons.check} size={10} className="inline mr-1" />}{o}
        </button>
      ))}
    </div>
  );
}

function Step1({ data, setData, onNext }) {
  const [errors, setErrors] = useState({});
  const validate = () => {
    const e = {};
    if (!data.storeUrl) e.storeUrl = "Store URL is required";
    else if (!/^https?:\/\/.+\..+/.test(data.storeUrl)) e.storeUrl = "Please enter a valid URL";
    if (!data.platform) e.platform = "Please select your platform";
    setErrors(e); return Object.keys(e).length === 0;
  };
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Connect Your Store</h2>
        <p className="text-slate-400 text-sm">Enter your store URL and we'll get your AI agent set up in 1–2 business days.</p>
      </div>
      <Field label="Store URL" id="storeUrl" error={errors.storeUrl} helper="e.g. https://mystore.myshopify.com">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"><Icon path={icons.globe} size={16} /></span>
          <input id="storeUrl" type="url" placeholder="https://yourstore.com" value={data.storeUrl}
            onChange={e => setData(d => ({ ...d, storeUrl: e.target.value }))}
            className={cx("w-full rounded-xl border bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-violet-500/60",
              errors.storeUrl ? "border-red-500/60" : "border-white/10 hover:border-white/20")} />
        </div>
        {errors.storeUrl && <p className="text-xs text-red-400 mt-1">{errors.storeUrl}</p>}
      </Field>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Platform</p>
        <div className="flex gap-3">
          <PlatformCard platform="shopify" selected={data.platform === "shopify"} onSelect={p => setData(d => ({ ...d, platform: p }))} />
          <PlatformCard platform="woocommerce" selected={data.platform === "woocommerce"} onSelect={p => setData(d => ({ ...d, platform: p }))} />
        </div>
        {errors.platform && <p className="text-xs text-red-400 mt-2">{errors.platform}</p>}
      </div>
      <div className="flex justify-end pt-2">
        <Btn onClick={() => validate() && onNext()}>Continue <Icon path={icons.arrow} size={16} /></Btn>
      </div>
    </div>
  );
}

function Step2({ data, setData, onNext, onBack }) {
  const [errors, setErrors] = useState({});
  const [validating, setValidating] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);
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
    setErrors(e); return Object.keys(e).length === 0;
  };
  const handleValidate = async () => {
    if (!validate()) return;
    setValidating(true); setApiStatus(null);
    try {
      await apiPost("/validate-credentials", { platform: data.platform, storeUrl: data.storeUrl, ...(isShopify ? { apiKey: data.apiKey, accessToken: data.accessToken } : { consumerKey: data.consumerKey, consumerSecret: data.consumerSecret }) });
      setApiStatus("success");
    } catch { setApiStatus("error"); } finally { setValidating(false); }
  };
  const shopifyInstructions = [
    <>In Shopify Admin go to <strong>Settings → Apps → Develop apps</strong>.</>,
    <>Click <strong>Create an app</strong>, name it "AgentComerce AI".</>,
    <>Enable scopes: <code className="text-violet-300 bg-violet-500/15 px-1 rounded text-xs">read_products</code> <code className="text-violet-300 bg-violet-500/15 px-1 rounded text-xs">read_orders</code> <code className="text-violet-300 bg-violet-500/15 px-1 rounded text-xs">read_customers</code></>,
    <>Click <strong>Install app</strong> then copy your <strong>API Key</strong> and <strong>Access Token</strong>.</>,
  ];
  const wooInstructions = [
    <>Go to <strong>WooCommerce → Settings → Advanced → REST API</strong>.</>,
    <>Click <strong>Add key</strong>, set description to "AgentComerce", select <strong>Read/Write</strong>.</>,
    <>Click <strong>Generate API key</strong> and copy your credentials below.</>,
    <>Make sure permalinks are set to "Post name" in WordPress settings.</>,
  ];
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className={cx("inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-3 border", isShopify ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/25" : "bg-blue-500/10 text-blue-300 border-blue-500/25")}>
          <Icon path={icons.store} size={12} /> {isShopify ? "Shopify" : "WooCommerce"} Integration
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">API Credentials</h2>
        <p className="text-slate-400 text-sm">Follow the steps to generate your credentials.</p>
      </div>
      <div className="space-y-2">
        {(isShopify ? shopifyInstructions : wooInstructions).map((txt, i) => <Instruction key={i} step={i + 1}>{txt}</Instruction>)}
      </div>
      <div className="space-y-4 pt-2">
        {isShopify ? (<>
          <Field label="API Key" id="apiKey" error={errors.apiKey} helper="Looks like: shpka_xxxxxxxx">
            <div className="relative"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"><Icon path={icons.key} size={16} /></span>
              <input id="apiKey" type="password" placeholder="shpka_xxx" value={data.apiKey || ""} onChange={e => setData(d => ({ ...d, apiKey: e.target.value }))}
                className={cx("w-full rounded-xl border bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-violet-500/60", errors.apiKey ? "border-red-500/60" : "border-white/10")} />
            </div>{errors.apiKey && <p className="text-xs text-red-400">{errors.apiKey}</p>}
          </Field>
          <Field label="Access Token" id="accessToken" error={errors.accessToken} helper="Looks like: shpat_xxxxxxxx">
            <div className="relative"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"><Icon path={icons.shield} size={16} /></span>
              <input id="accessToken" type="password" placeholder="shpat_xxx" value={data.accessToken || ""} onChange={e => setData(d => ({ ...d, accessToken: e.target.value }))}
                className={cx("w-full rounded-xl border bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-violet-500/60", errors.accessToken ? "border-red-500/60" : "border-white/10")} />
            </div>{errors.accessToken && <p className="text-xs text-red-400">{errors.accessToken}</p>}
          </Field>
        </>) : (<>
          <Field label="Consumer Key" id="consumerKey" error={errors.consumerKey} helper="Looks like: ck_xxxxxxxx">
            <div className="relative"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"><Icon path={icons.key} size={16} /></span>
              <input id="consumerKey" type="password" placeholder="ck_xxx" value={data.consumerKey || ""} onChange={e => setData(d => ({ ...d, consumerKey: e.target.value }))}
                className={cx("w-full rounded-xl border bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-violet-500/60", errors.consumerKey ? "border-red-500/60" : "border-white/10")} />
            </div>{errors.consumerKey && <p className="text-xs text-red-400">{errors.consumerKey}</p>}
          </Field>
          <Field label="Consumer Secret" id="consumerSecret" error={errors.consumerSecret} helper="Looks like: cs_xxxxxxxx">
            <div className="relative"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"><Icon path={icons.shield} size={16} /></span>
              <input id="consumerSecret" type="password" placeholder="cs_xxx" value={data.consumerSecret || ""} onChange={e => setData(d => ({ ...d, consumerSecret: e.target.value }))}
                className={cx("w-full rounded-xl border bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-violet-500/60", errors.consumerSecret ? "border-red-500/60" : "border-white/10")} />
            </div>{errors.consumerSecret && <p className="text-xs text-red-400">{errors.consumerSecret}</p>}
          </Field>
        </>)}
      </div>
      {apiStatus === "success" && <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-sm"><Icon path={icons.check} size={16} /> Credentials validated successfully!</div>}
      {apiStatus === "error" && <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm"><Icon path={icons.info} size={16} /> Could not validate. Check credentials or continue anyway.</div>}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/50 border border-white/5">
        <Icon path={icons.shield} size={16} className="text-violet-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-400 leading-relaxed">Your credentials are encrypted with AES-256 before storage and never exposed in our frontend.</p>
      </div>
      <div className="flex items-center justify-between pt-2">
        <Btn variant="ghost" onClick={onBack}><Icon path={icons.arrowL} size={16} /> Back</Btn>
        <div className="flex gap-3">
          <Btn variant="ghost" onClick={handleValidate} loading={validating}>Test Connection</Btn>
          <Btn onClick={() => validate() && onNext()}>Continue <Icon path={icons.arrow} size={16} /></Btn>
        </div>
      </div>
    </div>
  );
}

function Step3({ data, setData, onNext, onBack }) {
  const [errors, setErrors] = useState({});
  const validate = () => {
    const e = {};
    if (!data.storeName?.trim()) e.storeName = "Store name is required";
    if (!data.contactEmail?.trim()) e.contactEmail = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(data.contactEmail)) e.contactEmail = "Invalid email";
    setErrors(e); return Object.keys(e).length === 0;
  };
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Tell Us About Your Store</h2>
        <p className="text-slate-400 text-sm">This helps us customize your AI agent for your business.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Store Name" id="storeName" error={errors.storeName}>
          <input id="storeName" type="text" placeholder="My Awesome Store" value={data.storeName || ""} onChange={e => setData(d => ({ ...d, storeName: e.target.value }))}
            className={cx("w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-violet-500/60", errors.storeName ? "border-red-500/60" : "border-white/10")} />
          {errors.storeName && <p className="text-xs text-red-400">{errors.storeName}</p>}
        </Field>
        <Field label="Contact Email" id="contactEmail" error={errors.contactEmail}>
          <input id="contactEmail" type="email" placeholder="hello@yourstore.com" value={data.contactEmail || ""} onChange={e => setData(d => ({ ...d, contactEmail: e.target.value }))}
            className={cx("w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-violet-500/60", errors.contactEmail ? "border-red-500/60" : "border-white/10")} />
          {errors.contactEmail && <p className="text-xs text-red-400">{errors.contactEmail}</p>}
        </Field>
      </div>
      <Field label="Product Categories" id="categories" helper="Select all that apply">
        <MultiSelect options={CATEGORY_OPTIONS} selected={data.categories || []} onChange={v => setData(d => ({ ...d, categories: v }))} />
      </Field>
      <Field label="Delivery Methods" id="delivery" helper="Select all that apply">
        <MultiSelect options={DELIVERY_OPTIONS} selected={data.deliveryMethods || []} onChange={v => setData(d => ({ ...d, deliveryMethods: v }))} />
      </Field>
      <Field label="Return / Refund Policy" id="returnPolicy">
        <Textarea id="returnPolicy" placeholder="e.g. 30-day returns, unused items in original packaging..." value={data.returnPolicy || ""} onChange={e => setData(d => ({ ...d, returnPolicy: e.target.value }))} />
      </Field>
      <Field label="Frequently Asked Questions" id="faqs" helper="One question per line">
        <Textarea id="faqs" rows={5} placeholder={"Do you ship internationally?\nHow long does delivery take?\nWhat payment methods do you accept?"} value={data.faqs || ""} onChange={e => setData(d => ({ ...d, faqs: e.target.value }))} />
      </Field>
      <Field label="Special Notes" id="notes">
        <Textarea id="notes" placeholder="Anything the AI should know about your store..." value={data.notes || ""} onChange={e => setData(d => ({ ...d, notes: e.target.value }))} />
      </Field>
      <div className="flex items-center justify-between pt-2">
        <Btn variant="ghost" onClick={onBack}><Icon path={icons.arrowL} size={16} /> Back</Btn>
        <Btn onClick={() => validate() && onNext()}>Review & Submit <Icon path={icons.arrow} size={16} /></Btn>
      </div>
    </div>
  );
}

function Step4({ data, onBack }) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const handleSubmit = async () => {
    setSubmitting(true); setError(null);
    try { await apiPost("/submit", data); setSubmitted(true); }
    catch (e) { setError(e.message || "Submission failed."); }
    finally { setSubmitting(false); }
  };
  if (submitted) return (
    <div className="flex flex-col items-center text-center gap-6 py-4">
      <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-400/30 shadow-xl shadow-emerald-500/20">
        <Icon path={icons.check} size={36} className="text-emerald-400" />
      </div>
      <div>
        <h2 className="text-3xl font-bold text-white mb-3">You're All Set! 🎉</h2>
        <p className="text-slate-400 max-w-sm mx-auto leading-relaxed">We've received your store details. Our team will integrate your AI agent within <strong className="text-white">1–2 business days</strong>.</p>
      </div>
      <div className="w-full max-w-sm p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/20 text-left">
        <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold mb-1"><Icon path={icons.mail} size={14} /> Confirmation sent to</div>
        <p className="text-slate-400 text-xs">{data.contactEmail}</p>
      </div>
      <Btn variant="ghost" onClick={() => window.location.reload()}>Start a New Integration</Btn>
    </div>
  );
  const isShopify = data.platform === "shopify";
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Review & Submit</h2>
        <p className="text-slate-400 text-sm">Review your information before submitting.</p>
      </div>
      <div className="rounded-xl border border-white/10 overflow-hidden">
        {[["Store URL", data.storeUrl], ["Platform", <span className={cx("capitalize px-2 py-0.5 rounded-full text-xs font-semibold border", isShopify ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" : "bg-blue-500/15 text-blue-300 border-blue-500/25")}>{data.platform}</span>], ["Store Name", data.storeName], ["Contact", data.contactEmail], ["Categories", (data.categories || []).join(", ") || "—"]].map(([label, value], i) => (
          <div key={label} className={cx("flex items-start justify-between gap-4 px-5 py-4", i % 2 === 0 ? "bg-white/3" : "bg-transparent")}>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex-shrink-0 pt-0.5">{label}</span>
            <span className="text-sm text-slate-200 text-right break-all">{value || "—"}</span>
          </div>
        ))}
      </div>
      {error && <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm"><Icon path={icons.info} size={16} /> {error}</div>}
      <div className="flex items-center justify-between pt-2">
        <Btn variant="ghost" onClick={onBack} disabled={submitting}><Icon path={icons.arrowL} size={16} /> Back</Btn>
        <Btn onClick={handleSubmit} loading={submitting}><Icon path={icons.zap} size={16} /> Submit & Get Started</Btn>
      </div>
    </div>
  );
}

// ── LANDING PAGE ──────────────────────────────────────────────
function LandingPage({ onStart }) {
  const [activeFaq, setActiveFaq] = useState(null);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactSent, setContactSent] = useState(false);

  const stats = [
    { value: "500+", label: "Stores Connected", icon: icons.store },
    { value: "2M+", label: "Messages Handled", icon: icons.msg },
    { value: "98%", label: "Customer Satisfaction", icon: icons.star },
    { value: "1-2", label: "Days to Go Live", icon: icons.clock },
  ];

  const features = [
    { icon: icons.bot, title: "AI-Powered Chat", desc: "Answers every product question, 24 hours a day, 7 days a week — fully automated. Your customers get instant, accurate responses even at 3am." },
    { icon: icons.star, title: "Smart Recommendations", desc: "Our AI analyzes browsing behavior and purchase history to suggest the right products at the right time, boosting your average order value." },
    { icon: icons.zap, title: "Instant FAQ Handling", desc: "Never answer the same question twice. Train the AI on your FAQs and it handles shipping, returns, sizing, and more automatically." },
    { icon: icons.trending, title: "Sales Conversion", desc: "The AI doesn't just answer — it sells. It guides customers through their purchase journey, reducing cart abandonment by up to 40%." },
    { icon: icons.lock, title: "Secure Integration", desc: "All your credentials are encrypted with AES-256 encryption. Your data is safe, private, and never shared with third parties." },
    { icon: icons.refresh, title: "Always Learning", desc: "The AI improves over time. It learns from your store's conversations to give better and more accurate answers every week." },
  ];

  const steps = [
    { num: "01", title: "Connect Your Store", desc: "Enter your store URL and select Shopify or WooCommerce. We detect your platform automatically." },
    { num: "02", title: "Provide API Access", desc: "Follow our step-by-step guide to generate API credentials. Takes less than 5 minutes." },
    { num: "03", title: "Tell Us About Your Store", desc: "Share your FAQs, policies, and product categories so we can train the AI specifically for your business." },
    { num: "04", title: "We Set Everything Up", desc: "Our team installs and configures your AI agent within 1–2 business days. Zero technical work from you." },
  ];

  const testimonials = [
    { name: "Sarah M.", store: "Shopify Store Owner", text: "AgentComerce reduced our support tickets by 70%. Our customers love getting instant answers at any time of day. Best investment we made this year.", stars: 5, avatar: "SM" },
    { name: "Ahmed K.", store: "WooCommerce Store", text: "Setup was incredibly easy. The team handled everything and our AI agent was live in just one day. Sales increased 25% in the first month!", stars: 5, avatar: "AK" },
    { name: "Lisa T.", store: "Fashion Boutique", text: "I was skeptical at first but now I can't imagine running my store without it. The AI recommends products perfectly and handles all shipping questions.", stars: 5, avatar: "LT" },
    { name: "Raza H.", store: "Electronics Store", text: "Our cart abandonment dropped significantly. The AI catches customers before they leave and answers their last-minute questions. Incredible ROI.", stars: 5, avatar: "RH" },
    { name: "Emma W.", store: "Beauty & Skincare", text: "The AI knows my entire product catalog and recommends the right skincare routine for each customer. It's like having a knowledgeable salesperson 24/7.", stars: 5, avatar: "EW" },
    { name: "Omar F.", store: "Sports Equipment", text: "Customer support used to be our biggest headache. Now the AI handles 80% of queries automatically. My team can focus on growing the business.", stars: 5, avatar: "OF" },
  ];

  const faqs = [
    { q: "How long does the setup take?", a: "Our team typically completes the full integration within 1–2 business days. Once you submit your store details and credentials, we handle everything — no technical work required from your side." },
    { q: "Does it work with my Shopify or WooCommerce store?", a: "Yes! AgentComerce is purpose-built for both Shopify and WooCommerce stores. We connect via your store's official REST API to access products, orders, and store information." },
    { q: "Is my API data safe and secure?", a: "Absolutely. All your API credentials are encrypted using AES-256 encryption before being stored. We use HTTPS for all communications and your credentials are never exposed in our frontend code." },
    { q: "What happens after I submit my store details?", a: "Our team receives your submission, reviews your credentials, and begins configuring your AI agent. We train it on your products, FAQs, and store policies. You'll receive a confirmation email when it's live." },
    { q: "Can I customize what the AI says?", a: "Yes! During onboarding you can provide your FAQs, return policy, special instructions, and brand voice. The AI is trained specifically for your store and can be updated anytime." },
    { q: "What if I want to cancel?", a: "No contracts, no hassle. You can cancel your subscription at any time. We also offer a 14-day money-back guarantee if you're not satisfied with the service." },
    { q: "How does the $19/month pricing work?", a: "It's a simple flat fee of $19 per month with no hidden costs. This includes the AI agent, all updates, maintenance, and support. Cancel anytime with no penalties." },
  ];

  const handleContactSubmit = () => {
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setContactSent(true);
    setTimeout(() => { setContactOpen(false); setContactSent(false); setContactForm({ name: "", email: "", message: "" }); }, 3000);
  };

  return (
    <div className="min-h-screen text-white" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* ── NAVBAR ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full sticky top-0 backdrop-blur-xl bg-slate-950/80 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <Icon path={icons.bot} size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">AgentComerce</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/25 font-medium hidden sm:block">AI Powered</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => document.getElementById('features-section').scrollIntoView({ behavior: 'smooth' })} className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block">Features</button>
          <button onClick={() => setPricingOpen(true)} className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block">Pricing</button>
          <button onClick={() => document.getElementById('faq-section').scrollIntoView({ behavior: 'smooth' })} className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block">FAQ</button>
          <button onClick={() => setContactOpen(true)} className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block">Contact</button>
          <Btn onClick={onStart} className="text-sm px-4 py-2">Get Started</Btn>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-24 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-300 font-medium mb-6">
          <Icon path={icons.sparkle} size={12} /> Trusted by 500+ e-commerce stores worldwide
        </div>
        <h1 className="text-5xl sm:text-7xl font-extrabold text-white mb-6 leading-none tracking-tight">
          Your Store Sells<br />
          <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">While You Sleep.</span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed">
          Deploy an AI sales agent to your Shopify or WooCommerce store in 1–2 days. Answer questions, recommend products, handle FAQs — automatically, 24/7.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 items-center mb-8">
          <Btn onClick={onStart} className="text-base px-8 py-4">
            <Icon path={icons.zap} size={18} /> Connect Your Store — Free Setup
          </Btn>
          <button onClick={() => setDemoOpen(true)} className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
            See live demo <Icon path={icons.arrow} size={14} />
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
          {["No credit card required", "1–2 day setup", "Cancel anytime", "AES-256 encrypted"].map(t => (
            <div key={t} className="flex items-center gap-1.5"><Icon path={icons.check} size={11} className="text-emerald-400" />{t}</div>
          ))}
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map(({ value, label, icon }) => (
            <Card key={label} className="p-6 text-center">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center text-violet-400 mb-3 mx-auto">
                <Icon path={icon} size={20} />
              </div>
              <div className="text-3xl font-extrabold text-white mb-1">{value}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-300 font-medium mb-4">How It Works</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Up and Running in 4 Simple Steps</h2>
          <p className="text-slate-400 max-w-xl mx-auto">No technical knowledge required. We handle everything from setup to deployment.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map(({ num, title, desc }) => (
            <div key={num} className="relative">
              <Card className="p-6 h-full">
                <div className="text-5xl font-extrabold text-violet-500/20 mb-4 leading-none">{num}</div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </Card>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Btn onClick={onStart}><Icon path={icons.arrow} size={16} /> Start Your Integration</Btn>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features-section" className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-300 font-medium mb-4">Features</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Everything Your Store Needs</h2>
          <p className="text-slate-400 max-w-xl mx-auto">One AI agent that handles customer support, sales, and recommendations — all in one.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon, title, desc }) => (
            <Card key={title} className="p-6">
              <div className="w-12 h-12 rounded-xl bg-violet-500/15 flex items-center justify-center text-violet-400 mb-4">
                <Icon path={icon} size={22} />
              </div>
              <h3 className="font-bold text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-300 font-medium mb-4">Testimonials</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Loved by Store Owners</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Join hundreds of Shopify and WooCommerce store owners who are growing with AgentComerce.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map(({ name, store, text, stars, avatar }) => (
            <Card key={name} className="p-6">
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: stars }).map((_, i) => <Icon key={i} path={icons.star} size={14} className="text-amber-400 fill-amber-400" />)}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">"{text}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="w-9 h-9 rounded-full bg-violet-500/25 flex items-center justify-center text-violet-300 text-xs font-bold flex-shrink-0">{avatar}</div>
                <div>
                  <div className="text-sm font-semibold text-white">{name}</div>
                  <div className="text-xs text-slate-500">{store}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 pb-24 text-center">
        <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-300 font-medium mb-4">Pricing</div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
        <p className="text-slate-400 mb-10">One plan, everything included. No hidden fees, no surprises.</p>
        <Card className="p-8 sm:p-12 max-w-md mx-auto relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-t-2xl" />
          <div className="inline-flex items-center gap-2 bg-violet-500/15 border border-violet-500/25 text-violet-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">⚡ Most Popular</div>
          <div className="text-6xl font-extrabold text-white mb-2">$19<span className="text-xl font-normal text-slate-500">/mo</span></div>
          <p className="text-slate-400 text-sm mb-8">Everything you need to automate your store</p>
          <div className="space-y-3 text-left mb-8">
            {["🤖 AI Chat Agent for your store", "🕐 24/7 Automated customer support", "❓ FAQ automation & instant answers", "🧠 Store memory — last 10 messages", "🛍️ Works with Shopify & WooCommerce", "⚡ 1–2 day setup by our team", "🔒 AES-256 secure integration", "📧 Email notifications & reports"].map(f => (
              <div key={f} className="flex items-center gap-3 text-sm text-slate-300">
                <Icon path={icons.check} size={14} className="text-emerald-400 flex-shrink-0" />{f}
              </div>
            ))}
          </div>
          <Btn onClick={onStart} className="w-full justify-center text-base py-4">Get Started — $19/month</Btn>
          <p className="text-xs text-slate-500 mt-4">No contracts · Cancel anytime · 14-day money back</p>
        </Card>
      </section>

      {/* ── FAQ ── */}
      <section id="faq-section" className="relative z-10 max-w-3xl mx-auto px-6 pb-24">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-300 font-medium mb-4">FAQ</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-slate-400">Everything you need to know about AgentComerce.</p>
        </div>
        <div className="space-y-3">
          {faqs.map(({ q, a }, i) => (
            <Card key={i} className="overflow-hidden">
              <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                <span className="font-semibold text-white text-sm pr-4">{q}</span>
                <span className={cx("text-violet-400 transition-transform duration-300 flex-shrink-0", activeFaq === i ? "rotate-180" : "")}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                </span>
              </button>
              {activeFaq === i && <div className="px-5 pb-5 text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-4">{a}</div>}
            </Card>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <Card className="p-10 sm:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/10 pointer-events-none" />
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 relative">Ready to Automate<br />Your Store?</h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto relative">Join 500+ store owners who are saving hours every week and growing sales with AgentComerce.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative">
            <Btn onClick={onStart} className="text-base px-8 py-4"><Icon path={icons.zap} size={18} /> Start Free Setup Now</Btn>
            <Btn variant="ghost" onClick={() => setContactOpen(true)} className="text-base px-8 py-4"><Icon path={icons.mail} size={18} /> Talk to Us</Btn>
          </div>
          <p className="text-xs text-slate-600 mt-6 relative">No credit card required · Setup in 1–2 days · Cancel anytime</p>
        </Card>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-12 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-10">
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center"><Icon path={icons.bot} size={14} className="text-white" /></div>
              <span className="font-bold text-white">AgentComerce</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">AI-powered sales agents for Shopify and WooCommerce stores. Automate support, boost sales, grow faster.</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <Icon path={icons.mail} size={12} />
              <a href="mailto:codewithkhuzaima@gmail.com" className="hover:text-violet-400 transition-colors">codewithkhuzaima@gmail.com</a>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Product</p>
            <div className="space-y-2">
              {["Features", "Pricing", "How It Works", "Demo"].map(l => (
                <button key={l} onClick={() => l === "Pricing" ? setPricingOpen(true) : l === "Demo" ? setDemoOpen(true) : null} className="block text-sm text-slate-500 hover:text-white transition-colors">{l}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Support</p>
            <div className="space-y-2">
              {["Contact Us", "FAQ", "Privacy Policy", "Terms of Service"].map(l => (
                <button key={l} onClick={() => l === "Contact Us" ? setContactOpen(true) : l === "FAQ" ? document.getElementById('faq-section').scrollIntoView({ behavior: 'smooth' }) : null} className="block text-sm text-slate-500 hover:text-white transition-colors">{l}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">© 2026 AgentComerce. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <span className="flex items-center gap-1"><Icon path={icons.shield} size={11} className="text-emerald-400" /> AES-256 Encrypted</span>
            <span className="flex items-center gap-1"><Icon path={icons.lock} size={11} className="text-emerald-400" /> HTTPS Secured</span>
          </div>
        </div>
      </footer>

      {/* ── PRICING MODAL ── */}
      {pricingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setPricingOpen(false)}>
          <Card className="w-full max-w-md p-8 text-center relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPricingOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white">✕</button>
            <div className="inline-flex items-center gap-2 bg-violet-500/15 border border-violet-500/25 text-violet-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">⚡ Most Popular</div>
            <div className="text-5xl font-extrabold text-white mb-1">$19<span className="text-lg font-normal text-slate-500">/mo</span></div>
            <p className="text-slate-400 text-sm mb-6">Everything you need, no surprises</p>
            <div className="space-y-2 text-left mb-6">
              {["🤖 AI Chat Agent", "🕐 24/7 Support automation", "❓ FAQ handling", "🧠 Store memory (last 10 messages)", "🛍️ Shopify & WooCommerce", "⚡ 1–2 day setup", "🔒 Secure encryption"].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-slate-300"><Icon path={icons.check} size={12} className="text-emerald-400" />{f}</div>
              ))}
            </div>
            <Btn onClick={() => { setPricingOpen(false); onStart(); }} className="w-full justify-center">Get Started — $19/month</Btn>
            <p className="text-xs text-slate-500 mt-3">No contracts · Cancel anytime · 14-day money back</p>
          </Card>
        </div>
      )}

      {/* ── DEMO MODAL ── */}
      {demoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90" onClick={() => setDemoOpen(false)}>
          <div className="relative w-full max-w-5xl h-[85vh] rounded-2xl overflow-hidden border border-white/10" onClick={e => e.stopPropagation()}>
            <button onClick={() => setDemoOpen(false)} className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/80 flex items-center justify-center text-white text-lg border border-white/20">✕</button>
            <iframe src="/demo.html" className="w-full h-full border-none" title="AgentComerce Demo" />
          </div>
        </div>
      )}

      {/* ── CONTACT MODAL ── */}
      {contactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setContactOpen(false)}>
          <Card className="w-full max-w-md p-8 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setContactOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white">✕</button>
            {contactSent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4"><Icon path={icons.check} size={28} className="text-emerald-400" /></div>
                <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                <p className="text-slate-400 text-sm">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-white mb-2">Contact Us</h3>
                <p className="text-slate-400 text-sm mb-6">We typically respond within a few hours.</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1.5">Your Name</label>
                    <input type="text" placeholder="John Smith" value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-violet-500/60" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1.5">Email</label>
                    <input type="email" placeholder="you@example.com" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-violet-500/60" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1.5">Message</label>
                    <textarea rows={4} placeholder="Tell us about your store and what you need..." value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-violet-500/60 resize-none" />
                  </div>
                  <Btn onClick={handleContactSubmit} className="w-full justify-center"><Icon path={icons.mail} size={16} /> Send Message</Btn>
                  <p className="text-xs text-slate-500 text-center">Or email us directly: <a href="mailto:codewithkhuzaima@gmail.com" className="text-violet-400">codewithkhuzaima@gmail.com</a></p>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────────────
export default function App() {
  const [showFlow, setShowFlow] = useState(false);
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    storeUrl: "", platform: "", apiKey: "", accessToken: "", consumerKey: "", consumerSecret: "",
    storeName: "", contactEmail: "", categories: [], deliveryMethods: [], returnPolicy: "", faqs: "", notes: "",
  });
  const next = () => setStep(s => Math.min(s + 1, 4));
  const back = () => setStep(s => Math.max(s - 1, 1));

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-x-hidden" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;600;700;800&display=swap');
        * { box-sizing: border-box; } body { margin: 0; }
        ::selection { background: rgba(139,92,246,0.35); }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 99px; }
        .fill-amber-400 { fill: #fbbf24; }
      `}</style>
      <ParticleBg />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-violet-600/10 blur-3xl pointer-events-none z-0" />

      {!showFlow ? (
        <LandingPage onStart={() => setShowFlow(true)} />
      ) : (
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-xl">
            <div className="flex items-center gap-2 mb-10">
              <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center"><Icon path={icons.bot} size={14} className="text-white" /></div>
              <span className="font-bold text-white">AgentComerce</span>
              <button onClick={() => setShowFlow(false)} className="ml-auto text-xs text-slate-500 hover:text-white transition-colors">← Back to home</button>
            </div>
            <Progress step={step} />
            <Card className="p-6 sm:p-8">
              {step === 1 && <Step1 data={data} setData={setData} onNext={next} />}
              {step === 2 && <Step2 data={data} setData={setData} onNext={next} onBack={back} />}
              {step === 3 && <Step3 data={data} setData={setData} onNext={next} onBack={back} />}
              {step === 4 && <Step4 data={data} onBack={back} />}
            </Card>
            {step < 4 && (
              <div className="flex items-center justify-center gap-6 mt-6">
                {[["AES-256 Encrypted", icons.shield], ["1–2 Day Setup", icons.clock], ["500+ Stores", icons.star]].map(([label, icon]) => (
                  <div key={label} className="flex items-center gap-1.5 text-slate-600 text-xs"><Icon path={icon} size={12} /> {label}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
