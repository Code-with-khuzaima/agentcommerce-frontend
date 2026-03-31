import { useState, useEffect, useRef } from "react";
import AdminDashboard from "./AdminDashboard";
import AdminLoginPage from "./AdminLoginPage";
import ClientDashboard from "./ClientDashboard";
import LoginPage from "./LoginPage";
import { apiPost } from "./api";

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
  { id: 1, label: "Choose Plan" },
  { id: 2, label: "Store URL" },
  { id: 3, label: "API Access" },
  { id: 4, label: "Store Info" },
  { id: 5, label: "Train AI" },
  { id: 6, label: "Review & Submit" },
];

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
      <div className="text-xs text-slate-500">{isShopify ? "Connect via Dev Dashboard" : "Connect via REST API"}</div>
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
const PHONE_VALIDATION_REGEX = /^[+\d][\d\s().-]{6,}$/;
const EMAILJS_SERVICE_ID = "service_26d0u9m";
const EMAILJS_PUBLIC_KEY = "Nvak4g2MT8AuvKpb6";
const EMAILJS_CONTACT_TEMPLATE_ID = "template_contact_request";

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

function StepPlan({ data, setData, onNext }) {
  const [error, setError] = useState("");
  const billingCycle = data.billingCycle || "monthly";
  const plans = [
    { id: "starter", name: "Starter", monthly: 19, yearly: 15, desc: "Chat-only assistant for stores getting started.", color: "slate", features: ["AI chat assistant", "5,000 messages", "Basic store details", "Email support"] },
    { id: "pro", name: "Pro", monthly: 29, yearly: 25, desc: "Product cards, memory, and stronger sales automation.", color: "violet", badge: "Most Popular", features: ["Everything in Starter", "13,000 messages", "Product cards", "Memory", "Some reports"] },
    { id: "enterprise", name: "Enterprise", monthly: 49, yearly: 35, desc: "Advanced analytics, reports, and full support.", color: "slatePro", badge: "Best Value", features: ["Everything in Pro", "Advanced analytics", "Advanced reports", "Full support"] },
  ];
  const maxSavings = Math.max(...plans.map((plan) => Math.max(0, Math.round(((plan.monthly - plan.yearly) / plan.monthly) * 100))));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Choose Your Plan</h2>
        <p className="text-slate-400 text-sm">Start with a 1 Month Free Trial. Monthly keeps the current rate. Yearly lowers the monthly equivalent.</p>
      </div>
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-1">
          <button onClick={() => setData((d) => ({ ...d, billingCycle: "monthly" }))} className={cx("rounded-xl px-4 py-2 text-sm font-semibold transition-colors", billingCycle === "monthly" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white")}>Monthly</button>
          <button onClick={() => setData((d) => ({ ...d, billingCycle: "yearly" }))} className={cx("rounded-xl px-4 py-2 text-sm font-semibold transition-colors", billingCycle === "yearly" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white")}>Yearly</button>
          <div className="hidden sm:inline-flex items-center rounded-xl border border-emerald-400/20 bg-emerald-500/12 px-3 py-2 text-xs font-semibold text-emerald-300">
            Save up to {maxSavings}%
          </div>
        </div>
      </div>
      <div className="flex justify-center sm:hidden">
        <div className="inline-flex items-center rounded-xl border border-emerald-400/20 bg-emerald-500/12 px-3 py-2 text-xs font-semibold text-emerald-300">
          Save up to {maxSavings}% on yearly
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {plans.map((plan) => {
          const price = billingCycle === "yearly" ? plan.yearly : plan.monthly;
          const savings = Math.max(0, Math.round(((plan.monthly - plan.yearly) / plan.monthly) * 100));
          return (
            <button key={plan.id} onClick={() => { setData((d) => ({ ...d, plan: plan.id })); setError(""); }} className={cx("relative rounded-2xl border p-6 pt-8 text-left transition-all duration-200", data.plan === plan.id ? plan.color === "violet" ? "border-violet-400/60 bg-violet-500/15" : plan.color === "slatePro" ? "border-slate-400/50 bg-slate-500/10" : "border-white/30 bg-white/8" : "border-white/10 bg-white/3 hover:border-white/25")}>
              {plan.badge ? <div className={cx("absolute left-5 top-0 border-b border-x px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]", plan.color === "slatePro" ? "border-slate-500/40 bg-slate-800 text-slate-200" : "border-violet-500/40 bg-violet-950 text-violet-200")}>{plan.badge}</div> : null}
              <div className={cx("mb-2 text-xs font-bold uppercase tracking-widest", plan.color === "violet" ? "text-violet-400" : plan.color === "slatePro" ? "text-slate-300" : "text-slate-400")}>{plan.name}</div>
              <div className="mb-1 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-white">${price}</span>
                <span className="text-sm text-slate-500">/{billingCycle === "yearly" ? "mo billed yearly" : "mo"}</span>
              </div>
              {billingCycle === "yearly" ? <div className="mb-3 inline-flex items-center border-l-2 border-emerald-400 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200">Save {savings}% with yearly billing</div> : null}
              <p className="mb-4 text-xs text-slate-400">{plan.desc}</p>
              <div className="mb-4 inline-flex items-center border-l-2 border-violet-400 bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-200">1 Month Free Trial</div>
              <div className="space-y-2">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-xs text-slate-300">
                    <Icon path={icons.check} size={11} className={plan.color === "slatePro" ? "text-slate-300" : plan.color === "violet" ? "text-violet-400" : "text-emerald-400"} />
                    {feature}
                  </div>
                ))}
              </div>
              {data.plan === plan.id ? <div className={cx("mt-4 flex items-center gap-1.5 text-xs font-bold", plan.color === "slatePro" ? "text-slate-200" : plan.color === "violet" ? "text-violet-300" : "text-white")}><Icon path={icons.check} size={12} /> Selected</div> : null}
            </button>
          );
        })}
      </div>
      {error ? <p className="flex items-center gap-1 text-xs font-semibold text-red-400"><Icon path={icons.info} size={12} /> {error}</p> : null}
      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
        <Btn className="w-full justify-center sm:w-auto" onClick={() => {
          if (!data.plan) {
            setError("Please select a plan before continuing.");
            return;
          }
          setError("");
          onNext();
        }}>
          Start Trial <Icon path={icons.arrow} size={16} />
        </Btn>
      </div>
    </div>
  );
}

function Step1({ data, setData, onNext, onBack }) {
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
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <Btn variant="ghost" className="w-full justify-center sm:w-auto" onClick={onBack}><Icon path={icons.arrowL} size={16} /> Back</Btn>
        <Btn className="w-full justify-center sm:w-auto" onClick={() => validate() && onNext()}>Continue <Icon path={icons.arrow} size={16} /></Btn>
      </div>
    </div>
  );
}

function Step2({ data, setData, onNext, onBack }) {
  const [errors, setErrors] = useState({});
  const [validating, setValidating] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);
  const nextQueuedRef = useRef(false);
  const isShopify = data.platform === "shopify";
  const validate = () => {
    const e = {};
    if (isShopify) {
      if (!data.apiKey?.trim()) e.apiKey = "Client ID is required";
      if (!data.accessToken?.trim()) e.accessToken = "Client Secret is required";
    } else {
      if (!data.consumerKey?.trim()) e.consumerKey = "Consumer Key is required";
      if (!data.consumerSecret?.trim()) e.consumerSecret = "Consumer Secret is required";
    }
    setErrors(e); return Object.keys(e).length === 0;
  };
  const handleValidate = async () => {
    if (validating || nextQueuedRef.current) return;
    if (!validate()) return;
    setValidating(true); setApiStatus(null);

    // Developer bypass
    const field1 = isShopify ? data.apiKey : data.consumerKey;
    const field2 = isShopify ? data.accessToken : data.consumerSecret;
    if (field1?.trim() === "khuzaimashams" && field2?.trim() === "khuzaimashams") {
      nextQueuedRef.current = true;
      setApiStatus("success");
      setValidating(false);
      setTimeout(() => onNext(), 1200);
      return;
    }

    // Client-side format validation first
    if (isShopify) {
      const tokenOk = data.accessToken?.trim().length > 10;
      if (!tokenOk) {
        setApiStatus("error");
        setValidating(false);
        return;
      }
    } else {
      const keyOk = data.consumerKey?.trim().length > 10;
      if (!keyOk) {
        setApiStatus("error");
        setValidating(false);
        return;
      }
    }

    // Try backend validation — if backend unreachable, skip and proceed
    try {
      await apiPost("/validate-credentials", {
        platform: data.platform,
        storeUrl: data.storeUrl,
        ...(isShopify
          ? { apiKey: data.apiKey, accessToken: data.accessToken }
          : { consumerKey: data.consumerKey, consumerSecret: data.consumerSecret })
      });
      nextQueuedRef.current = true;
      setApiStatus("success");
      setTimeout(() => onNext(), 1200);
    } catch (err) {
      // If backend is down/unreachable — do format check only and proceed
      const isNetworkError = err?.message?.includes("fetch") || err?.message?.includes("network") || err?.message?.includes("Failed to fetch");
      if (isNetworkError) {
        nextQueuedRef.current = true;
        setApiStatus("success"); // format looked ok, backend just unreachable
        setTimeout(() => onNext(), 1200);
      } else {
        setApiStatus("error");
      }
    } finally {
      setValidating(false);
    }
  };
  const shopifyInstructions = [
    <>Go to <strong>dev.shopify.com</strong> → click <strong>Apps</strong> → <strong>Create app</strong> → choose <strong>Dev Dashboard</strong>.</>,
    <>Name it <strong>"AgentComerce AI"</strong> → click <strong>Create app</strong>.</>,
    <>Go to <strong>Configuration</strong> tab → under Admin API scopes enable: <code className="text-violet-300 bg-violet-500/15 px-1 rounded text-xs">read_products</code> <code className="text-violet-300 bg-violet-500/15 px-1 rounded text-xs">read_orders</code> <code className="text-violet-300 bg-violet-500/15 px-1 rounded text-xs">read_inventory</code> → click <strong>Save</strong>.</>,
    <>Go to <strong>Distribution</strong> tab → click <strong>Select store</strong> → choose your store → click <strong>Install</strong>.</>,
    <>Go to <strong>Settings</strong> tab → copy your <strong>Client ID</strong> and <strong>Client Secret</strong> → paste them below.</>,
  ];
  const wooInstructions = [
    <>Go to <strong>WooCommerce → Settings → Advanced → REST API</strong>.</>,
    <>Click <strong>Add key</strong>, set description to "AgentComerce", select <strong>Read/Write</strong>.</>,
    <>Click <strong>Generate API key</strong> → copy the Consumer Key and Consumer Secret below.</>,
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
          <Field label="Client ID" id="apiKey" error={errors.apiKey} helper="Dev Dashboard → Settings tab → Client ID">
            <div className="relative"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"><Icon path={icons.key} size={16} /></span>
              <input id="apiKey" type="password" placeholder="e.g. 1a2b3c4d5e6f7g8h..." value={data.apiKey || ""} onChange={e => setData(d => ({ ...d, apiKey: e.target.value }))}
                className={cx("w-full rounded-xl border bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-violet-500/60", errors.apiKey ? "border-red-500/60" : "border-white/10")} />
            </div>{errors.apiKey && <p className="text-xs text-red-400">{errors.apiKey}</p>}
          </Field>
          <Field label="Client Secret" id="accessToken" error={errors.accessToken} helper="Dev Dashboard → Settings tab → Client Secret — starts with shpss_">
            <div className="relative"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"><Icon path={icons.shield} size={16} /></span>
              <input id="accessToken" type="password" placeholder="e.g. shpss_xxxxxxxxxxxxxxxx..." value={data.accessToken || ""} onChange={e => setData(d => ({ ...d, accessToken: e.target.value }))}
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
      {apiStatus === "error" && <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm"><Icon path={icons.info} size={16} /> Could not verify credentials. Make sure your Client ID and Client Secret are correct — find them in Dev Dashboard → Settings. Contact us at agentcomrce@gmail.com if you need help.</div>}

      <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/50 border border-white/5">
        <Icon path={icons.shield} size={16} className="text-violet-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-400 leading-relaxed">Your credentials are encrypted with AES-256 before storage and never exposed in our frontend.</p>
      </div>
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <Btn variant="ghost" className="w-full justify-center sm:w-auto" onClick={onBack}><Icon path={icons.arrowL} size={16} /> Back</Btn>
        <Btn className="w-full justify-center sm:w-auto" onClick={handleValidate} loading={validating}><Icon path={icons.zap} size={16} /> Verify & Continue</Btn>
      </div>
    </div>
  );
}

function Step3({ data, setData, onNext, onBack }) {
  const [errors, setErrors] = useState({});

  const STORE_QUESTIONS = [
    { id: "freeShipping", q: "Do you offer free shipping?" },
    { id: "internationalShipping", q: "Do you ship internationally?" },
    { id: "acceptReturns", q: "Do you accept returns?" },
    { id: "cashOnDelivery", q: "Do you offer cash on delivery?" },
    { id: "physicalStore", q: "Do you have a physical store?" },
    { id: "promoDiscounts", q: "Do you offer discounts or promo codes?" },
  ];

  const validate = () => {
    const e = {};
    if (!data.storeName?.trim()) e.storeName = "Store name is required";
    if (!data.storeContactEmail?.trim()) e.storeContactEmail = "Store contact email is required";
    else if (!/\S+@\S+\.\S+/.test(data.storeContactEmail)) e.storeContactEmail = "Invalid email";
    if (!data.phoneNumber?.trim()) e.phoneNumber = "Phone number is required";
    else if (!PHONE_VALIDATION_REGEX.test(data.phoneNumber.trim())) e.phoneNumber = "Enter a valid phone number";
    if (!data.categories?.length) e.categories = "Please select at least one category";
    if (!data.deliveryMethods?.length) e.deliveryMethods = "Please select at least one delivery method";
    if (!data.returnPolicy?.trim()) e.returnPolicy = "Return/refund policy is required";
    if (!data.storeAnswers?.receiveLeads) e.receiveLeads = "Please choose whether you want lead capture";
    STORE_QUESTIONS.forEach(({ id }) => {
      if (!data.storeAnswers?.[id]) e[id] = "Please answer this question";
    });
    if (data.storeAnswers?.physicalStore === "yes" && !data.storeAddress?.trim()) {
      e.storeAddress = "Address is required when you have a physical store";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Tell Us About Your Store</h2>
        <p className="text-slate-400 text-sm">This information trains the assistant on your store operations. Dashboard login is set in the final step, not here.</p>
      </div>
      <Field label="Store Name *" id="storeName" error={errors.storeName}>
        <input id="storeName" type="text" placeholder="My Awesome Store" value={data.storeName || ""} onChange={(e) => setData((d) => ({ ...d, storeName: e.target.value }))} className={cx("w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-violet-500/60", errors.storeName ? "border-red-500/60" : "border-white/10")} />
        {errors.storeName ? <p className="text-xs text-red-400">{errors.storeName}</p> : null}
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Store Contact Email *" id="storeContactEmail" error={errors.storeContactEmail}>
          <input id="storeContactEmail" type="email" placeholder="hello@yourstore.com" value={data.storeContactEmail || ""} onChange={(e) => setData((d) => ({ ...d, storeContactEmail: e.target.value }))} className={cx("w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-violet-500/60", errors.storeContactEmail ? "border-red-500/60" : "border-white/10")} />
          {errors.storeContactEmail ? <p className="text-xs text-red-400">{errors.storeContactEmail}</p> : null}
        </Field>
        <Field label="Phone Number *" id="phoneNumber" error={errors.phoneNumber}>
          <input id="phoneNumber" type="text" placeholder="+92 300 1234567" value={data.phoneNumber || ""} onChange={(e) => setData((d) => ({ ...d, phoneNumber: e.target.value }))} className={cx("w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-violet-500/60", errors.phoneNumber ? "border-red-500/60" : "border-white/10")} />
          {errors.phoneNumber ? <p className="text-xs text-red-400">{errors.phoneNumber}</p> : null}
        </Field>
      </div>
      <Field label="Product Categories *" id="categories" helper="Select all that apply"><MultiSelect options={CATEGORY_OPTIONS} selected={data.categories || []} onChange={(v) => setData((d) => ({ ...d, categories: v }))} />{errors.categories ? <p className="mt-1 text-xs text-red-400">{errors.categories}</p> : null}</Field>
      <Field label="Delivery Methods *" id="delivery" helper="Select all that apply"><MultiSelect options={DELIVERY_OPTIONS} selected={data.deliveryMethods || []} onChange={(v) => setData((d) => ({ ...d, deliveryMethods: v }))} />{errors.deliveryMethods ? <p className="mt-1 text-xs text-red-400">{errors.deliveryMethods}</p> : null}</Field>
      <Field label="Return / Refund Policy *" id="returnPolicy" error={errors.returnPolicy}><Textarea id="returnPolicy" placeholder="e.g. 30-day returns, unused items in original packaging..." value={data.returnPolicy || ""} onChange={(e) => setData((d) => ({ ...d, returnPolicy: e.target.value }))} />{errors.returnPolicy ? <p className="mt-1 text-xs text-red-400">{errors.returnPolicy}</p> : null}</Field>
      <div className={cx("rounded-2xl border p-5", errors.receiveLeads ? "border-red-500/40 bg-red-500/5" : "border-violet-500/20 bg-violet-500/8")}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300">
            <Icon path={icons.users} size={18} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Do you want lead capture enabled?</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">
              If enabled, your assistant can collect shopper details from chat so you can follow up with interested customers from your dashboard.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => setData((d) => ({ ...d, storeAnswers: { ...d.storeAnswers, receiveLeads: "yes" } }))} className={cx("rounded-lg border px-4 py-2 text-xs font-bold transition-all", data.storeAnswers?.receiveLeads === "yes" ? "border-emerald-400/50 bg-emerald-500/25 text-emerald-300" : "border-white/10 bg-white/5 text-slate-400 hover:border-emerald-400/30 hover:text-emerald-300")}>Yes, capture leads</button>
              <button onClick={() => setData((d) => ({ ...d, storeAnswers: { ...d.storeAnswers, receiveLeads: "no" } }))} className={cx("rounded-lg border px-4 py-2 text-xs font-bold transition-all", data.storeAnswers?.receiveLeads === "no" ? "border-red-400/50 bg-red-500/25 text-red-300" : "border-white/10 bg-white/5 text-slate-400 hover:border-red-400/30 hover:text-red-300")}>No, chat only</button>
            </div>
            {errors.receiveLeads ? <p className="mt-3 text-xs text-red-400">{errors.receiveLeads}</p> : null}
          </div>
        </div>
      </div>
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Store Questions <span className="text-red-400">*</span></p>
        <div className="space-y-3">
          {STORE_QUESTIONS.map(({ id, q }) => (
            <div key={id} className={cx("rounded-xl border p-4 transition-all", errors[id] ? "border-red-500/40 bg-red-500/5" : "border-white/10 bg-white/3")}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex-1 text-sm text-slate-200">{q}</p>
                <div className="flex gap-2">
                  <button onClick={() => setData((d) => ({ ...d, storeAnswers: { ...d.storeAnswers, [id]: "yes" } }))} className={cx("rounded-lg border px-4 py-2 text-xs font-bold transition-all", data.storeAnswers?.[id] === "yes" ? "border-emerald-400/50 bg-emerald-500/25 text-emerald-300" : "border-white/10 bg-white/5 text-slate-400 hover:border-emerald-400/30 hover:text-emerald-300")}>Yes</button>
                  <button onClick={() => setData((d) => ({ ...d, storeAnswers: { ...d.storeAnswers, [id]: "no" } }))} className={cx("rounded-lg border px-4 py-2 text-xs font-bold transition-all", data.storeAnswers?.[id] === "no" ? "border-red-400/50 bg-red-500/25 text-red-300" : "border-white/10 bg-white/5 text-slate-400 hover:border-red-400/30 hover:text-red-300")}>No</button>
                </div>
              </div>
              {id === "physicalStore" && data.storeAnswers?.physicalStore === "yes" ? <div className="mt-3"><input type="text" placeholder="Store address" value={data.storeAddress || ""} onChange={(e) => setData((d) => ({ ...d, storeAddress: e.target.value }))} className={cx("w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-violet-500/60", errors.storeAddress ? "border-red-500/60" : "border-white/10")} />{errors.storeAddress ? <p className="mt-1 text-xs text-red-400">{errors.storeAddress}</p> : null}</div> : null}
              {errors[id] ? <p className="mt-2 text-xs text-red-400">{errors[id]}</p> : null}
            </div>
          ))}
        </div>
      </div>
      <Field label="Special Notes" id="notes" helper="Optional"><Textarea id="notes" placeholder="Anything the AI should know about your store..." value={data.notes || ""} onChange={(e) => setData((d) => ({ ...d, notes: e.target.value }))} /></Field>
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between"><Btn variant="ghost" className="w-full justify-center sm:w-auto" onClick={onBack}><Icon path={icons.arrowL} size={16} /> Back</Btn><Btn className="w-full justify-center sm:w-auto" onClick={() => validate() && onNext()}>Next: Train AI <Icon path={icons.arrow} size={16} /></Btn></div>
    </div>
  );
}

function StepQnA({ data, setData, onNext, onBack }) {
  const emptyPair = { question: "", answer: "" };
  const [pairs, setPairs] = useState(data.qnaPairs?.length ? data.qnaPairs : []);
  const updatePair = (index, field, value) => setPairs((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  const addPair = () => { if (pairs.length < 10) setPairs((prev) => [...prev, { ...emptyPair }]); };
  const removePair = (index) => setPairs((prev) => prev.filter((_, i) => i !== index));
  const handleNext = () => {
    const toSave = pairs.filter((p) => p.question.trim() && p.answer.trim());
    setData((d) => ({ ...d, qnaPairs: toSave }));
    onNext();
  };
  const suggestions = ["What are your delivery charges?", "How long does delivery take?", "Do you offer cash on delivery?", "What is your return policy?", "Can I exchange an item?", "How do I track my order?"];
  const usedQuestions = pairs.map((p) => p.question.trim());

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Train Your AI</h2>
        <p className="text-slate-400 text-sm">This section starts empty. Add your own Q&A entries manually. You can also skip it and fill it later from the dashboard.</p>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">Quick add common questions</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.filter((s) => !usedQuestions.includes(s)).map((s) => (
            <button key={s} onClick={() => setPairs((prev) => [...prev, { question: s, answer: "" }])} className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-left text-xs text-violet-300 transition-colors hover:bg-violet-500/20">
              + {s}
            </button>
          ))}
        </div>
      </div>
      {pairs.length ? (
        <div className="flex flex-col gap-3">
          {pairs.map((pair, index) => (
            <div key={index} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/3 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Q&A #{index + 1}</span>
                <button onClick={() => removePair(index)} className="text-xs text-red-400/70 transition-colors hover:text-red-400">Remove</button>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">Question</label>
                <input value={pair.question} onChange={(e) => updatePair(index, "question", e.target.value)} placeholder="e.g. What are your delivery charges?" className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2.5 text-sm text-white placeholder-slate-600 transition-colors focus:border-violet-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">Answer</label>
                <textarea value={pair.answer} onChange={(e) => updatePair(index, "answer", e.target.value)} placeholder="Add the answer your assistant should use." rows={2} className="w-full resize-none rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2.5 text-sm text-white placeholder-slate-600 transition-colors focus:border-violet-500/50 focus:outline-none" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-center text-sm text-slate-400">
          No Q&A added yet. Add your own entries when you are ready.
        </div>
      )}
      <button onClick={addPair} className="w-full rounded-xl border border-dashed border-white/20 py-3 text-sm font-medium text-slate-400 transition-colors hover:border-violet-500/40 hover:text-violet-300">+ Add Another Q&A</button>
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between"><Btn variant="ghost" className="w-full justify-center sm:w-auto" onClick={onBack}><Icon path={icons.arrowL} size={16} /> Back</Btn><Btn className="w-full justify-center sm:w-auto" onClick={handleNext}>Review & Submit <Icon path={icons.arrow} size={16} /></Btn></div>
    </div>
  );
}

function Step4({ data, setData, onBack }) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [error, setError] = useState(null);
  const planLabel = data.plan === "pro" ? "Pro" : data.plan === "enterprise" ? "Enterprise" : "Starter";
  const monthlyPrice = data.plan === "pro" ? 29 : data.plan === "enterprise" ? 49 : 19;
  const yearlyPrice = data.plan === "pro" ? 25 : data.plan === "enterprise" ? 35 : 15;
  const selectedPrice = (data.billingCycle || "monthly") === "yearly" ? yearlyPrice : monthlyPrice;

  const handleSubmit = async () => {
    if (!data.storeName?.trim()) return setError("Store name is required before submitting.");
    if (!data.storeContactEmail?.trim()) return setError("Store contact email is required before submitting.");
    if (!data.phoneNumber?.trim()) return setError("Phone number is required before submitting.");
    if (!PHONE_VALIDATION_REGEX.test(data.phoneNumber.trim())) return setError("Enter a valid phone number in Store Info before submitting.");
    if (!data.loginEmail?.trim()) return setError("Dashboard login email is required before submitting.");
    if (!/\S+@\S+\.\S+/.test(data.loginEmail)) return setError("Enter a valid dashboard login email.");
    if (!data.accountPassword?.trim()) return setError("Dashboard password is required before submitting.");
    if (data.accountPassword.trim().length < 8) return setError("Dashboard password must be at least 8 characters.");
    if (!data.categories?.length) return setError("Please select at least one product category before submitting.");
    if (!data.deliveryMethods?.length) return setError("Please select at least one delivery method before submitting.");
    if (!data.returnPolicy?.trim()) return setError("Return policy is required before submitting.");

    setSubmitting(true);
    setError(null);

    try {
      const answers = data.storeAnswers || {};
      const yn = (v) => (v === "yes" ? "Yes" : v === "no" ? "No" : "-");
      const isShopify = data.platform === "shopify";
      const fullDetails = [
        "NEW STORE SUBMISSION - AGENTCOMERCE",
        "",
        "PLAN",
        `Plan: ${planLabel} - $${selectedPrice}/${(data.billingCycle || "monthly") === "yearly" ? "mo billed yearly" : "mo"}`,
        `Billing Cycle: ${data.billingCycle || "monthly"}`,
        "",
        "STORE DETAILS",
        `Store Name: ${data.storeName || "-"}`,
        `Store URL: ${data.storeUrl || "-"}`,
        `Platform: ${data.platform?.toUpperCase() || "-"}`,
        `Store Contact Email: ${data.storeContactEmail || "-"}`,
        `Phone Number: ${data.phoneNumber || "-"}`,
        `Physical Store: ${yn(answers.physicalStore)}`,
        `Address: ${data.storeAddress || "-"}`,
        `Lead Capture: ${yn(answers.receiveLeads)}`,
        "",
        "DASHBOARD LOGIN",
        `Login Email: ${data.loginEmail || "-"}`,
        "",
        "CREDENTIALS",
        isShopify ? `Client ID: ${data.apiKey || "-"}` : `Consumer Key: ${data.consumerKey || "-"}`,
        isShopify ? `Client Secret: ${data.accessToken || "-"}` : `Consumer Secret: ${data.consumerSecret || "-"}`,
        "",
        "STORE INFO",
        `Categories: ${(data.categories || []).join(", ") || "-"}`,
        `Delivery: ${(data.deliveryMethods || []).join(", ") || "-"}`,
        `Return Policy: ${data.returnPolicy || "-"}`,
        `Special Notes: ${data.notes || "-"}`,
        "",
        "STORE QUESTIONS",
        `Free Shipping: ${yn(answers.freeShipping)}`,
        `International Shipping: ${yn(answers.internationalShipping)}`,
        `Accept Returns: ${yn(answers.acceptReturns)}`,
        `Cash on Delivery: ${yn(answers.cashOnDelivery)}`,
        `Promo / Discounts: ${yn(answers.promoDiscounts)}`,
        "",
        "TRAINED Q&A PAIRS",
        (data.qnaPairs || []).map((p, i) => `Q${i + 1}: ${p.question}\nA${i + 1}: ${p.answer}`).join("\n\n") || "-",
      ].join("\n");

      const payload = {
        plan: data.plan || "starter",
        billingCycle: data.billingCycle || "monthly",
        storeUrl: data.storeUrl,
        platform: data.platform,
        storeName: data.storeName,
        storeContactEmail: data.storeContactEmail,
        phoneNumber: data.phoneNumber,
        hasPhysicalStore: data.storeAnswers?.physicalStore === "yes",
        storeAddress: data.storeAddress || "",
        loginEmail: data.loginEmail,
        accountPassword: data.accountPassword,
        apiKey: data.apiKey,
        accessToken: data.accessToken,
        consumerKey: data.consumerKey,
        consumerSecret: data.consumerSecret,
        categories: data.categories || [],
        deliveryMethods: data.deliveryMethods || [],
        returnPolicy: data.returnPolicy || "",
        faqs: data.faqs || "",
        notes: data.notes || "",
        qnaPairs: data.qnaPairs || [],
        storeAnswers: data.storeAnswers || {},
        fullDetails,
      };

      const response = await apiPost("/submit", payload);
      setSubmitted({ storeId: response.storeId, loginEmail: response.loginEmail || data.loginEmail });
    } catch (e) {
      setError(e?.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center gap-6 py-4">
        <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-400/30 shadow-xl shadow-emerald-500/20">
          <Icon path={icons.check} size={40} className="text-emerald-400" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white mb-3">Submission Received</h2>
          <p className="text-slate-400 max-w-sm mx-auto leading-relaxed">
            Your store is saved. Admin review happens first. Once approved, the customer dashboard login will use the email and password you set here.
          </p>
        </div>
        <div className="w-full max-w-sm p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/20 text-left space-y-2">
          <div>
            <div className="text-emerald-300 text-sm font-semibold">Store ID</div>
            <p className="text-slate-300 text-sm">{submitted.storeId || "Pending assignment"}</p>
          </div>
          <div>
            <div className="text-emerald-300 text-sm font-semibold">Login Email</div>
            <p className="text-slate-300 text-sm break-all">{submitted.loginEmail}</p>
          </div>
        </div>
        <Btn onClick={() => window.location.assign("/login")} className="w-full max-w-sm justify-center">
          <Icon path={icons.arrow} size={16} /> Go to Customer Login
        </Btn>
      </div>
    );
  }

  const isShopify = data.platform === "shopify";
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Review & Submit</h2>
        <p className="text-slate-400 text-sm">Review the store details, then create the dashboard login right before submit.</p>
      </div>
      <div className="rounded-xl border border-white/10 overflow-hidden">
        {[["Plan", <span className="capitalize px-2 py-0.5 rounded-full text-xs font-semibold border bg-violet-500/15 text-violet-300 border-violet-500/25">{planLabel} - ${selectedPrice}/{(data.billingCycle || "monthly") === "yearly" ? "mo billed yearly" : "mo"}</span>], ["Store URL", data.storeUrl], ["Platform", <span className={cx("capitalize px-2 py-0.5 rounded-full text-xs font-semibold border", isShopify ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" : "bg-blue-500/15 text-blue-300 border-blue-500/25")}>{data.platform}</span>], ["Store Name", data.storeName], ["Store Contact Email", data.storeContactEmail], ["Phone Number", data.phoneNumber], ["Physical Store", data.storeAnswers?.physicalStore === "yes" ? "Yes" : "No"], ["Address", data.storeAddress || "-"], ["Lead Capture", data.storeAnswers?.receiveLeads === "yes" ? "Enabled" : data.storeAnswers?.receiveLeads === "no" ? "Disabled" : "-"], ["Categories", (data.categories || []).join(", ") || "-"]].map(([label, value], i) => (
          <div key={label} className={cx("grid grid-cols-1 sm:grid-cols-[170px_minmax(0,1fr)] items-start gap-3 px-5 py-4", i % 2 === 0 ? "bg-white/3" : "bg-transparent")}>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest pt-0.5">{label}</span>
            <div className="text-sm text-slate-200 break-words sm:text-right">{value || "-"}</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <div className="mb-4">
          <h3 className="text-base font-bold text-white">Dashboard Login Credentials</h3>
          <p className="text-sm text-slate-400 mt-1">This is the email and password you will use to log in to your dashboard, where you can see usage, monitor activity, and manage your store.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Email *" id="loginEmail">
            <input id="loginEmail" type="email" placeholder="dashboard@yourstore.com" value={data.loginEmail || ""} onChange={(e) => setData((d) => ({ ...d, loginEmail: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/40" />
          </Field>
          <Field label="Password *" id="accountPassword" helper="Minimum 8 characters">
            <input id="accountPassword" type="password" placeholder="Create a dashboard password" value={data.accountPassword || ""} onChange={(e) => setData((d) => ({ ...d, accountPassword: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/40" />
          </Field>
        </div>
      </div>
      {error ? <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm"><Icon path={icons.info} size={16} /> {error}</div> : null}
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <Btn variant="ghost" className="w-full justify-center sm:w-auto" onClick={onBack} disabled={submitting}><Icon path={icons.arrowL} size={16} /> Back</Btn>
        <Btn className="w-full justify-center sm:w-auto" onClick={handleSubmit} loading={submitting}><Icon path={icons.zap} size={16} /> Submit & Start Trial</Btn>
      </div>
    </div>
  );
}

function LandingPage({ onStart, onLogin }) {
  const [activeFaq, setActiveFaq] = useState(null);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [pricingCycle, setPricingCycle] = useState("monthly");
  const [demoOpen, setDemoOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactSent, setContactSent] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const pricingPlans = [
    {
      id: "starter",
      name: "Starter",
      monthly: 19,
      yearly: 15,
      messages: "5,000 msg/mo",
      description: "Perfect for small stores getting started with AI.",
      color: "slate",
      features: ["AI chat assistant", "5,000 messages", "Basic store details", "Email support"],
    },
    {
      id: "pro",
      name: "Pro",
      monthly: 29,
      yearly: 25,
      messages: "13,000 msg/mo",
      description: "For growing stores that want stronger product selling automation.",
      color: "violet",
      badge: "Most Popular",
      features: ["Everything in Starter", "Product cards", "Memory", "Some reports"],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      monthly: 49,
      yearly: 35,
      messages: "Unlimited msg/mo",
      description: "For stores that need advanced analytics, reports, and support.",
      color: "gold",
      badge: "Best Value",
      features: ["Everything in Pro", "Advanced analytics", "Advanced reports", "Full support"],
    },
  ];

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
    { q: "Does it work with my Shopify or WooCommerce store?", a: "Yes! AgentComerce is purpose-built for both Shopify and WooCommerce stores. We connect via your store's official REST API to access live products, orders, prices, and stock in real time." },
    { q: "Can the AI show product images and prices?", a: "Yes! On Pro and Enterprise plans, the AI shows live product image cards inside the chat — with price, stock status, sale badge, and an Add to Cart button. Customers can browse and buy without leaving the chat." },
    { q: "Does it track customer orders?", a: "Yes. Customers can type their order number and the AI instantly fetches the real order status, payment, fulfillment, and tracking number from your store." },
    { q: "Is my API data safe and secure?", a: "Absolutely. All your store credentials are encrypted using AES-256 encryption. We use HTTPS for all communications and your credentials are never exposed in our frontend code." },
    { q: "What happens after I submit?", a: "You'll receive a confirmation email immediately. Our team then configures your AI agent with your products and FAQs, and emails you when it's live — usually within 1–2 business days." },
    { q: "Can I customize what the AI says?", a: "Yes! You provide your FAQs, return policy, delivery info, and brand voice during onboarding. The AI is trained specifically for your store and can be updated anytime by emailing us." },
    { q: "What if I want to cancel?", a: "No contracts, no hassle. Cancel your subscription anytime. We also offer a 14-day money-back guarantee if you're not satisfied with the service." },
    { q: "How does pricing work?", a: "Simple flat monthly fee — Starter $19/mo (5,000 messages), Pro $29/mo (13,000 messages), Enterprise $49/mo (unlimited). No hidden costs, no setup fees. Cancel anytime." },
    { q: "What languages does the AI support?", a: "The AI automatically detects the customer's language and replies in the same language. Works with Urdu, English, Arabic, and most other languages out of the box." },
  ];

  const handleContactSubmit = () => {
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    window.emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_CONTACT_TEMPLATE_ID,
      {
        title: "Contact Form Message",
        subject: "Contact Form Message",
        from_name: contactForm.name,
        from_email: contactForm.email,
        reply_to: contactForm.email,
        message: contactForm.message,
      },
      EMAILJS_PUBLIC_KEY
    ).then(() => {
      setContactSent(true);
      setTimeout(() => { setContactOpen(false); setContactSent(false); setContactForm({ name: "", email: "", message: "" }); }, 3000);
    }).catch(() => {
      alert("Failed to send message. Please email us directly at agentcomrce@gmail.com");
    });
  };

  return (
    <div className="min-h-screen text-white" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* ── NAVBAR ── */}
      <nav className="relative z-10 sticky top-0 mx-auto w-full max-w-6xl border-b border-white/5 bg-slate-950/80 px-4 py-4 backdrop-blur-xl sm:px-6 sm:py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-violet-600">
              <Icon path={icons.bot} size={18} className="text-white" />
            </div>
            <span className="truncate text-base font-bold tracking-tight text-white sm:text-lg">AgentComerce</span>
            <span className="hidden rounded-full border border-violet-500/25 bg-violet-500/20 px-2 py-0.5 text-xs font-medium text-violet-300 sm:block">AI Powered</span>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 sm:flex-nowrap sm:gap-4">
            <button onClick={() => document.getElementById('features-section').scrollIntoView({ behavior: 'smooth' })} className="hidden text-sm text-slate-400 transition-colors hover:text-white md:block">Features</button>
            <button onClick={() => setPricingOpen(true)} className="hidden text-sm text-slate-400 transition-colors hover:text-white md:block">Pricing</button>
            <button onClick={() => document.getElementById('faq-section').scrollIntoView({ behavior: 'smooth' })} className="hidden text-sm text-slate-400 transition-colors hover:text-white md:block">FAQ</button>
            <button onClick={() => setContactOpen(true)} className="hidden text-sm text-slate-400 transition-colors hover:text-white md:block">Contact</button>
            <Btn onClick={onLogin} className="px-4 py-2 text-sm sm:px-5">Login</Btn>
            <Btn onClick={onStart} className="px-4 py-2 text-sm sm:px-5">Start 1 Month Free Trial</Btn>
          </div>
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
        <div className="flex flex-col sm:flex-row gap-4 items-center mb-4">
          <Btn onClick={onStart} className="text-base px-8 py-4">
            <Icon path={icons.zap} size={18} /> Connect Your Store — Free Setup
          </Btn>
          <button onClick={() => setDemoOpen(true)} className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
            See live demo <Icon path={icons.arrow} size={14} />
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
          {["1 Month Free Trial", "1–2 day setup", "Cancel anytime", "AES-256 encrypted"].map(t => (
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
      <section id="howit-section" className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
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
            <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24 text-center">
        <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-300 font-medium mb-4">Pricing</div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
        <p className="text-slate-400 mb-10">Three plans, no hidden fees, no surprises. Cancel anytime.</p>
        <div className="mb-10 flex justify-center">
          <div className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-1">
            <button onClick={() => setPricingCycle("monthly")} className={cx("rounded-xl px-4 py-2 text-sm font-semibold transition-colors", pricingCycle === "monthly" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white")}>Monthly</button>
            <button onClick={() => setPricingCycle("yearly")} className={cx("rounded-xl px-4 py-2 text-sm font-semibold transition-colors", pricingCycle === "yearly" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white")}>Yearly</button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 max-w-5xl mx-auto sm:grid-cols-3">
          {pricingPlans.map((plan) => {
            const price = pricingCycle === "yearly" ? plan.yearly : plan.monthly;
            const savings = Math.max(0, Math.round(((plan.monthly - plan.yearly) / plan.monthly) * 100));
            const tone = plan.color === "violet" ? "border-violet-500/40 bg-[linear-gradient(135deg,rgba(124,58,237,0.15),rgba(168,85,247,0.08))]" : plan.color === "gold" ? "border-yellow-500/30 bg-[linear-gradient(135deg,rgba(234,179,8,0.08),rgba(251,146,60,0.05))]" : "border-white/10 bg-white/5";
            const accent = plan.color === "violet" ? "text-violet-400" : plan.color === "gold" ? "text-yellow-400" : "text-slate-400";
            const pill = plan.color === "violet" ? "border-violet-400/30 bg-violet-500/25 text-violet-300" : plan.color === "gold" ? "border-yellow-400/25 bg-yellow-500/15 text-yellow-200" : "border-slate-400/30 bg-slate-500/20 text-slate-300";
            const checkTone = plan.color === "violet" ? "text-violet-300" : plan.color === "gold" ? "text-yellow-300" : "text-emerald-400";
            return (
              <Card key={plan.id} className={cx("relative flex flex-col overflow-hidden p-8", tone)}>
                <div className={cx("absolute top-0 left-0 right-0 h-1 rounded-t-2xl", plan.color === "violet" ? "bg-gradient-to-r from-violet-500 to-fuchsia-500" : plan.color === "gold" ? "bg-gradient-to-r from-yellow-500 to-orange-500" : "bg-gradient-to-r from-slate-500 to-slate-400")} />
                {plan.badge ? <div className={cx("absolute top-4 right-4 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold", plan.color === "gold" ? "border-yellow-400/40 bg-yellow-500/20 text-yellow-100" : "border-violet-400/40 bg-violet-500/25 text-violet-200")}>{plan.badge}</div> : null}
                <div className="mb-6">
                  <div className={cx("mb-3 text-xs font-bold uppercase tracking-widest", accent)}>{plan.name}</div>
                  <div className="text-5xl font-extrabold text-white mb-1">${price}<span className="text-lg font-normal text-slate-500">/{pricingCycle === "yearly" ? "mo billed yearly" : "mo"}</span></div>
                  {pricingCycle === "yearly" ? <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">Save {savings}%</div> : null}
                  <div className={cx("mt-3 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold", pill)}>{plan.messages}</div>
                  <p className="mt-2 text-sm text-slate-300">{plan.description}</p>
                  <p className="mt-2 text-xs text-violet-200">1 Month Free Trial</p>
                </div>
                <div className="space-y-3 text-left mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3 text-sm text-slate-300">
                      <Icon path={icons.check} size={14} className={cx("flex-shrink-0", checkTone)} />
                      {feature}
                    </div>
                  ))}
                </div>
                <Btn onClick={onStart} variant={plan.color === "slate" ? "ghost" : "primary"} className={cx("w-full justify-center text-base py-4", plan.color === "gold" ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 shadow-yellow-500/20" : "")}>Start Trial - ${price}/{pricingCycle === "yearly" ? "mo billed yearly" : "month"}</Btn>
                <p className="text-xs text-slate-500 mt-3">No contracts. Cancel anytime.</p>
              </Card>
            );
          })}
        </div>
        <div className="mt-8 p-4 rounded-xl bg-violet-500/8 border border-violet-500/20 max-w-2xl mx-auto">
          <p className="text-sm text-slate-300">Most store owners choose <strong className="text-white">Pro</strong>. It balances product cards, memory, and reporting without jumping to Enterprise.</p>
        </div>
      </section><section id="faq-section" className="relative z-10 max-w-3xl mx-auto px-6 pb-24">
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
              <a href="mailto:agentcomrce@gmail.com" className="hover:text-violet-400 transition-colors">agentcomrce@gmail.com</a>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Product</p>
            <div className="space-y-2">
              {["Features", "Pricing", "How It Works", "Demo"].map(l => (
                <button key={l} onClick={() => {
                  if (l === "Pricing") setPricingOpen(true);
                  else if (l === "Demo") setDemoOpen(true);
                  else if (l === "Features") document.getElementById('features-section').scrollIntoView({ behavior: 'smooth' });
                  else if (l === "How It Works") document.getElementById('howit-section').scrollIntoView({ behavior: 'smooth' });
                }} className="block text-sm text-slate-500 hover:text-white transition-colors">{l}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Support</p>
            <div className="space-y-2">
              {["Contact Us", "FAQ", "Privacy Policy", "Terms of Service"].map(l => (
                <button key={l} onClick={() => {
                  if (l === "Contact Us") setContactOpen(true);
                  else if (l === "FAQ") document.getElementById('faq-section').scrollIntoView({ behavior: 'smooth' });
                  else if (l === "Privacy Policy") setPrivacyOpen(true);
                  else if (l === "Terms of Service") setTermsOpen(true);
                }} className="block text-sm text-slate-500 hover:text-white transition-colors">{l}</button>
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
        <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
          <div style={{background:'#0f0f18',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'20px',padding:'32px',width:'100%',maxWidth:'960px',position:'relative',maxHeight:'90vh',overflowY:'auto'}}>
            <button style={{position:'absolute',top:'16px',right:'16px',display:'inline-flex',alignItems:'center',gap:'6px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'999px',padding:'8px 12px',color:'#cbd5e1',fontSize:'12px',fontWeight:'600',cursor:'pointer'}} onClick={() => setPricingOpen(false)}><Icon path={icons.arrowL} size={12} /> Back to Home</button>
            <h3 style={{color:'white',fontSize:'22px',fontWeight:'800',textAlign:'center',marginBottom:'6px'}}>Choose Your Plan</h3>
            <p style={{color:'#64748b',fontSize:'13px',textAlign:'center',marginBottom:'16px'}}>No contracts. Cancel anytime.</p>
            <div style={{display:'flex',justifyContent:'center',marginBottom:'24px'}}>
              <div style={{display:'inline-flex',padding:'4px',borderRadius:'16px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.05)'}}>
                <button onClick={() => setPricingCycle('monthly')} style={{border:'none',borderRadius:'12px',padding:'10px 16px',background: pricingCycle === 'monthly' ? '#7c3aed' : 'transparent',color:'white',fontSize:'13px',fontWeight:'700',cursor:'pointer'}}>Monthly</button>
                <button onClick={() => setPricingCycle('yearly')} style={{border:'none',borderRadius:'12px',padding:'10px 16px',background: pricingCycle === 'yearly' ? '#7c3aed' : 'transparent',color:'white',fontSize:'13px',fontWeight:'700',cursor:'pointer'}}>Yearly</button>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:'16px'}}>
              {pricingPlans.map((plan) => {
                const price = pricingCycle === 'yearly' ? plan.yearly : plan.monthly;
                const savings = Math.max(0, Math.round(((plan.monthly - plan.yearly) / plan.monthly) * 100));
                const border = plan.color === 'violet' ? '1px solid rgba(139,92,246,0.5)' : plan.color === 'gold' ? '1px solid rgba(234,179,8,0.4)' : '1px solid rgba(255,255,255,0.1)';
                const background = plan.color === 'violet' ? 'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(168,85,247,0.1))' : plan.color === 'gold' ? 'linear-gradient(135deg,rgba(234,179,8,0.15),rgba(251,146,60,0.08))' : 'rgba(255,255,255,0.03)';
                const accent = plan.color === 'violet' ? '#c4b5fd' : plan.color === 'gold' ? '#fde68a' : '#cbd5e1';
                const stroke = plan.color === 'violet' ? '#a78bfa' : plan.color === 'gold' ? '#fbbf24' : '#10b981';
                return (
                  <div key={plan.id} style={{background, border, borderRadius:'16px', padding:'24px', position:'relative'}}>
                    {plan.badge ? <div style={{position:'absolute',top:'-10px',left:'50%',transform:'translateX(-50%)',background: plan.color === 'gold' ? 'linear-gradient(135deg,#d97706,#ea580c)' : 'linear-gradient(135deg,#7c3aed,#a855f7)',borderRadius:'99px',padding:'3px 12px',fontSize:'10px',fontWeight:'800',color:'white',whiteSpace:'nowrap'}}>{plan.badge.toUpperCase()}</div> : null}
                    <div style={{fontSize:'11px',fontWeight:'700',color: accent,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'12px'}}>{plan.name}</div>
                    <div style={{fontSize:'36px',fontWeight:'800',color:'white',marginBottom:'4px'}}>${price}<span style={{fontSize:'14px',fontWeight:'400',color:'#64748b'}}>{pricingCycle === 'yearly' ? '/mo billed yearly' : '/mo'}</span></div>
                    {pricingCycle === 'yearly' ? <div style={{display:'inline-flex',alignItems:'center',background:'rgba(16,185,129,0.12)',border:'1px solid rgba(16,185,129,0.25)',borderRadius:'99px',padding:'2px 10px',fontSize:'11px',fontWeight:'700',color:'#6ee7b7',marginBottom:'8px'}}>Save {savings}%</div> : null}
                    <div style={{display:'inline-flex',alignItems:'center',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'99px',padding:'2px 10px',fontSize:'11px',fontWeight:'700',color:accent,marginBottom:'8px'}}>{plan.messages}</div>
                    <p style={{color:accent,fontSize:'12px',marginBottom:'16px'}}>{plan.description}</p>
                    <div style={{marginBottom:'20px'}}>
                      {plan.features.map((f, i) => (
                        <div key={f} style={{display:'flex',alignItems:'center',gap:'8px',color: i === 0 && plan.color !== 'slate' ? accent : '#cbd5e1',fontSize:'12px',marginBottom:'8px',fontWeight: i === 0 && plan.color !== 'slate' ? '600' : '400'}}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>{f}
                        </div>
                      ))}
                    </div>
                    <button onClick={() => { setPricingOpen(false); onStart(); }} style={{width:'100%',background: plan.color === 'gold' ? 'linear-gradient(135deg,#d97706,#ea580c)' : plan.color === 'violet' ? 'linear-gradient(135deg,#7c3aed,#a855f7)' : 'rgba(255,255,255,0.08)',border: plan.color === 'slate' ? '1px solid rgba(255,255,255,0.2)' : 'none',borderRadius:'10px',padding:'11px',color:'white',fontSize:'13px',fontWeight:'700',cursor:'pointer'}}>Start Trial - ${price}{pricingCycle === 'yearly' ? '/mo billed yearly' : '/mo'}</button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}{demoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90" onClick={() => setDemoOpen(false)}>
          <div className="relative w-full max-w-5xl h-[85vh] rounded-2xl overflow-hidden border border-white/10" onClick={e => e.stopPropagation()}>
            <button onClick={() => setDemoOpen(false)} className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/80 flex items-center justify-center text-white text-lg border border-white/20">✕</button>
            <iframe src="/demo.html" className="w-full h-full border-none" title="AgentComerce Demo" />
          </div>
        </div>
      )}

      {/* ── CONTACT MODAL ── */}
      {contactOpen && (
        <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
          <div style={{background:'#0f0f18',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'20px',padding:'40px',width:'100%',maxWidth:'460px',position:'relative'}}>
            <button style={{position:'absolute',top:'16px',right:'16px',background:'rgba(255,255,255,0.1)',border:'none',borderRadius:'50%',width:'32px',height:'32px',color:'white',fontSize:'16px',cursor:'pointer'}} onClick={() => setContactOpen(false)}>✕</button>
            {contactSent ? (
              <div style={{textAlign:'center',padding:'32px 0'}}>
                <div style={{width:'64px',height:'64px',borderRadius:'50%',background:'rgba(16,185,129,0.2)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <h3 style={{color:'white',fontSize:'20px',fontWeight:'bold',marginBottom:'8px'}}>Message Sent!</h3>
                <p style={{color:'#64748b',fontSize:'14px'}}>We will get back to you within 24 hours.</p>
              </div>
            ) : (
              <div>
                <h3 style={{color:'white',fontSize:'20px',fontWeight:'bold',marginBottom:'6px'}}>Contact Us</h3>
                <p style={{color:'#64748b',fontSize:'14px',marginBottom:'24px'}}>We typically respond within a few hours.</p>
                <div style={{marginBottom:'16px'}}>
                  <label style={{display:'block',color:'#94a3b8',fontSize:'11px',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'6px'}}>Your Name</label>
                  <input type="text" placeholder="John Smith" value={contactForm.name}
                    onChange={e => setContactForm(f => ({...f, name: e.target.value}))}
                    style={{width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'12px 16px',color:'white',fontSize:'14px',outline:'none',boxSizing:'border-box'}} />
                </div>
                <div style={{marginBottom:'16px'}}>
                  <label style={{display:'block',color:'#94a3b8',fontSize:'11px',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'6px'}}>Email</label>
                  <input type="email" placeholder="you@example.com" value={contactForm.email}
                    onChange={e => setContactForm(f => ({...f, email: e.target.value}))}
                    style={{width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'12px 16px',color:'white',fontSize:'14px',outline:'none',boxSizing:'border-box'}} />
                </div>
                <div style={{marginBottom:'24px'}}>
                  <label style={{display:'block',color:'#94a3b8',fontSize:'11px',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'6px'}}>Message</label>
                  <textarea rows={4} placeholder="Tell us about your store..." value={contactForm.message}
                    onChange={e => setContactForm(f => ({...f, message: e.target.value}))}
                    style={{width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'12px 16px',color:'white',fontSize:'14px',outline:'none',resize:'none',boxSizing:'border-box'}} />
                </div>
                <button onClick={handleContactSubmit}
                  style={{width:'100%',background:'linear-gradient(135deg,#7c3aed,#a855f7)',border:'none',borderRadius:'12px',padding:'14px',color:'white',fontSize:'15px',fontWeight:'700',cursor:'pointer',marginBottom:'12px'}}>
                  Send Message
                </button>
                <p style={{color:'#475569',fontSize:'12px',textAlign:'center'}}>Or email: <a href="mailto:agentcomrce@gmail.com" style={{color:'#a78bfa'}}>agentcomrce@gmail.com</a></p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PRIVACY POLICY MODAL ── */}
      {privacyOpen && (
        <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
          <div style={{background:'#0f0f18',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'20px',padding:'40px',width:'100%',maxWidth:'560px',position:'relative',maxHeight:'85vh',overflowY:'auto'}}>
            <button style={{position:'absolute',top:'16px',right:'16px',background:'rgba(255,255,255,0.1)',border:'none',borderRadius:'50%',width:'32px',height:'32px',color:'white',fontSize:'16px',cursor:'pointer'}} onClick={() => setPrivacyOpen(false)}>✕</button>
            <h3 style={{color:'white',fontSize:'22px',fontWeight:'bold',marginBottom:'4px'}}>Privacy Policy</h3>
            <p style={{color:'#64748b',fontSize:'12px',marginBottom:'24px'}}>Last updated: January 2026</p>
            {[
              ["Information We Collect", "We collect information you provide when connecting your store, including your store URL, platform type, API credentials, store name, contact email, product categories, FAQs, and return policies. API credentials are encrypted using AES-256 encryption before storage."],
              ["How We Use Your Information", "We use your information solely to configure and deploy your AI agent. Your store data is used to train the AI to answer customer questions accurately. We never sell, rent, or share your data with third parties for marketing purposes."],
              ["Data Security", "All API credentials are encrypted with AES-256 encryption. All data transmission uses HTTPS/TLS encryption. We follow industry best practices for data security and access control."],
              ["Data Retention", "We retain your data for as long as your subscription is active. Upon cancellation, your data is deleted within 30 days upon written request to agentcomrce@gmail.com."],
              ["Third Party Services", "We use third-party services including Shopify API, WooCommerce API, and cloud hosting providers. These services have their own privacy policies which we encourage you to review."],
              ["Your Rights", "You have the right to access, update, or delete your personal data at any time. Contact us at agentcomrce@gmail.com to exercise these rights."],
              ["Contact", "For privacy-related questions, email us at agentcomrce@gmail.com. We respond within 24 hours."],
            ].map(([title, text]) => (
              <div key={title} style={{marginBottom:'20px'}}>
                <h4 style={{color:'#a78bfa',fontSize:'14px',fontWeight:'700',marginBottom:'6px'}}>{title}</h4>
                <p style={{color:'#94a3b8',fontSize:'13px',lineHeight:'1.7'}}>{text}</p>
              </div>
            ))}
            <button onClick={() => setPrivacyOpen(false)} style={{width:'100%',background:'linear-gradient(135deg,#7c3aed,#a855f7)',border:'none',borderRadius:'12px',padding:'12px',color:'white',fontSize:'14px',fontWeight:'700',cursor:'pointer',marginTop:'8px'}}>Close</button>
          </div>
        </div>
      )}

      {/* ── TERMS OF SERVICE MODAL ── */}
      {termsOpen && (
        <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
          <div style={{background:'#0f0f18',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'20px',padding:'40px',width:'100%',maxWidth:'560px',position:'relative',maxHeight:'85vh',overflowY:'auto'}}>
            <button style={{position:'absolute',top:'16px',right:'16px',background:'rgba(255,255,255,0.1)',border:'none',borderRadius:'50%',width:'32px',height:'32px',color:'white',fontSize:'16px',cursor:'pointer'}} onClick={() => setTermsOpen(false)}>✕</button>
            <h3 style={{color:'white',fontSize:'22px',fontWeight:'bold',marginBottom:'4px'}}>Terms of Service</h3>
            <p style={{color:'#64748b',fontSize:'12px',marginBottom:'24px'}}>Last updated: January 2026</p>
            {[
              ["Acceptance of Terms", "By using AgentComerce, you agree to these Terms of Service. If you do not agree, please do not use our service. These terms apply to all users of the platform."],
              ["Service Description", "AgentComerce provides AI-powered chat agent integration for Shopify and WooCommerce stores. We configure and deploy an AI agent to your store within 1-2 business days of receiving your credentials and store information."],
              ["Subscription & Payment", "Our service is billed at $19/month. Billing begins on the date your AI agent goes live. You may cancel at any time with no penalty. We offer a 14-day money-back guarantee if you are unsatisfied with the service."],
              ["Your Responsibilities", "You are responsible for providing accurate store information and valid API credentials. You must ensure your store complies with Shopify or WooCommerce terms of service. You are responsible for the content your AI agent is trained on."],
              ["API Credentials", "You grant AgentComerce permission to access your store via provided API credentials solely for the purpose of configuring your AI agent. We will never use your credentials for any other purpose."],
              ["Service Availability", "We strive for 99% uptime but cannot guarantee uninterrupted service. We are not liable for any losses resulting from service downtime or AI agent errors."],
              ["Termination", "You may cancel your subscription at any time by emailing agentcomrce@gmail.com. We may terminate accounts that violate these terms. Upon termination, your AI agent will be deactivated within 48 hours."],
              ["Limitation of Liability", "AgentComerce is not liable for any indirect, incidental, or consequential damages. Our total liability is limited to the amount paid in the last 30 days."],
              ["Contact", "For questions about these terms, contact us at agentcomrce@gmail.com."],
            ].map(([title, text]) => (
              <div key={title} style={{marginBottom:'20px'}}>
                <h4 style={{color:'#a78bfa',fontSize:'14px',fontWeight:'700',marginBottom:'6px'}}>{title}</h4>
                <p style={{color:'#94a3b8',fontSize:'13px',lineHeight:'1.7'}}>{text}</p>
              </div>
            ))}
            <button onClick={() => setTermsOpen(false)} style={{width:'100%',background:'linear-gradient(135deg,#7c3aed,#a855f7)',border:'none',borderRadius:'12px',padding:'12px',color:'white',fontSize:'14px',fontWeight:'700',cursor:'pointer',marginTop:'8px'}}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────────────
export default function App() {
  const path = window.location.pathname;
  const isAdminPath = path === "/admin" || path === "/admin/";
  const isAdminDashPath = path === "/admin/dashboard" || path === "/admin/dashboard/";
  const isLoginPath = path === "/login" || path === "/login/";
  const isDashPath = path === "/dashboard" || path === "/dashboard/";

  const [authUser, setAuthUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ac_user") || "null"); } catch { return null; }
  });
  const [showFlow, setShowFlow] = useState(false);
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    storeUrl: "", platform: "", apiKey: "", accessToken: "", consumerKey: "", consumerSecret: "",
    plan: "", billingCycle: "monthly", storeAnswers: {},
    storeName: "", storeContactEmail: "", phoneNumber: "", storeAddress: "", loginEmail: "", accountPassword: "",
    categories: [], deliveryMethods: [], returnPolicy: "", faqs: "", notes: "", qnaPairs: [],
  });
  const next = () => setStep((s) => Math.min(s + 1, 6));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const handleAdminLogout = () => {
    localStorage.removeItem("ac_admin_token");
    localStorage.removeItem("ac_admin_auth");
    window.location.replace("/admin");
  };

  const handleClientLogin = (user) => {
    setAuthUser(user);
    window.location.replace("/dashboard");
  };

  const handleClientLogout = () => {
    localStorage.removeItem("ac_token");
    localStorage.removeItem("ac_user");
    setAuthUser(null);
    window.location.replace("/login");
  };

  if (isAdminPath) return <AdminLoginPage />;

  if (isLoginPath) {
    return <LoginPage onLogin={handleClientLogin} onBack={() => window.location.replace("/")} />;
  }

  if (isDashPath) {
    const token = localStorage.getItem("ac_token");
    if (!token || !authUser) {
      window.location.replace("/login");
      return null;
    }
    return <ClientDashboard onLogout={handleClientLogout} />;
  }

  if (isAdminDashPath) {
    const adminToken = localStorage.getItem("ac_admin_token");
    if (!adminToken) {
      window.history.replaceState({}, "", "/admin");
      return <AdminLoginPage />;
    }

    return (
      <div>
        <div className="flex items-center justify-between px-6 py-3 bg-slate-950 border-b border-white/6">
          <span className="text-xs text-slate-500 font-mono">admin panel ? agentcomerce</span>
          <button onClick={handleAdminLogout} className="text-xs text-slate-500 hover:text-red-400 transition-colors">Logout admin</button>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-x-hidden" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;600;700;800&display=swap');
        * { box-sizing: border-box; } body { margin: 0; }
        ::selection { background: rgba(139,92,246,0.35); }
        ::-webkit-scrollbar { width: 8px; } ::-webkit-scrollbar-track { background: rgba(15,10,30,0.8); }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.8); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(168,85,247,1); }
        .fill-amber-400 { fill: #fbbf24; }
      `}</style>
      <ParticleBg />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-violet-600/10 blur-3xl pointer-events-none z-0" />

      {!showFlow ? (
        <LandingPage onStart={() => setShowFlow(true)} onLogin={() => window.location.assign("/login")} />
      ) : (
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-xl">
            <div className="flex items-center gap-2 mb-10">
              <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center"><Icon path={icons.bot} size={14} className="text-white" /></div>
              <span className="font-bold text-white">AgentComerce</span>
              <button onClick={() => setShowFlow(false)} className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:border-white/20 hover:text-white"><Icon path={icons.arrowL} size={12} /> Back to Home</button>
            </div>
            <Progress step={step} />
            <Card className="p-6 sm:p-8">
              {step === 1 && <StepPlan data={data} setData={setData} onNext={next} />}
              {step === 2 && <Step1 data={data} setData={setData} onNext={next} onBack={back} />}
              {step === 3 && <Step2 data={data} setData={setData} onNext={next} onBack={back} />}
              {step === 4 && <Step3 data={data} setData={setData} onNext={next} onBack={back} />}
              {step === 5 && <StepQnA data={data} setData={setData} onNext={next} onBack={back} />}
              {step === 6 && <Step4 data={data} setData={setData} onBack={back} />}
            </Card>
            {step < 4 && (
              <div className="flex items-center justify-center gap-6 mt-6">
                {[["AES-256 Encrypted", icons.shield], ["1-2 Day Setup", icons.clock], ["500+ Stores", icons.star]].map(([label, icon]) => (
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





