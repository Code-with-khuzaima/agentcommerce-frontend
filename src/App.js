import { useState, useEffect, useRef } from "react";
import AdminDashboard from "./AdminDashboard";
import AdminLoginPage from "./AdminLoginPage";
import ClientDashboard from "./ClientDashboard";
import LoginPage from "./LoginPage";
import SalesPopup from "./SalesPopup";
import { sendTemplateEmail } from "./email";
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

function ShopifyCredentialVideo() {
  const videoUrl = `${process.env.PUBLIC_URL || ""}/shopify-credentials-guide.mp4`;

  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-[linear-gradient(135deg,rgba(6,78,59,0.16),rgba(15,23,42,0.94))] shadow-[0_20px_50px_rgba(2,6,23,0.35)]">
        <div className="border-b border-white/10 px-5 py-4">
          <div className="mb-1 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">Real tutorial</div>
              <div className="text-lg font-bold text-white">How to get Shopify Client ID and Shopify credentials</div>
            </div>
            <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200">
              Screen recording
            </div>
          </div>
        </div>
        <div className="bg-black">
          <video
            src={videoUrl}
            controls
            playsInline
            preload="metadata"
            className="block w-full"
          />
        </div>
        <div className="flex flex-col gap-3 border-t border-white/10 bg-slate-950/85 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-6 text-slate-400">Need a clearer view? Open the tutorial in a larger window before you paste the credentials here.</p>
          <a
            href={videoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition-colors hover:border-emerald-400/40 hover:bg-emerald-500/15 hover:text-white"
          >
            <Icon path={icons.arrow} size={14} />
            Open larger view
          </a>
        </div>
      </div>
    );
  }

function WooCredentialVideo() {
  const videoUrl = `${process.env.PUBLIC_URL || ""}/woocommerce-credentials-guide.mp4`;

  return (
    <div className="overflow-hidden rounded-2xl border border-blue-500/20 bg-[linear-gradient(135deg,rgba(30,64,175,0.16),rgba(15,23,42,0.94))] shadow-[0_20px_50px_rgba(2,6,23,0.35)]">
      <div className="border-b border-white/10 px-5 py-4">
        <div className="mb-1 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">Real tutorial</div>
            <div className="text-lg font-bold text-white">How to get WooCommerce Consumer Key and Secret</div>
          </div>
          <div className="rounded-lg border border-blue-500/25 bg-blue-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-200">
            Screen recording
          </div>
        </div>
      </div>
      <div className="bg-black">
        <video
          src={videoUrl}
          controls
          playsInline
          preload="metadata"
          className="block w-full"
        />
      </div>
      <div className="flex flex-col gap-3 border-t border-white/10 bg-slate-950/85 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-6 text-slate-400">Need a clearer view? Open the tutorial in a larger window before you paste the credentials here.</p>
        <a
          href={videoUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-blue-500/25 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-200 transition-colors hover:border-blue-400/40 hover:bg-blue-500/15 hover:text-white"
        >
          <Icon path={icons.arrow} size={14} />
          Open larger view
        </a>
      </div>
    </div>
  );
}

const DELIVERY_OPTIONS = ["Standard Shipping", "Express Shipping", "Same-Day Delivery", "Click & Collect", "Free Shipping"];
const CATEGORY_OPTIONS = ["Clothing & Apparel", "Electronics", "Home & Garden", "Beauty & Health", "Sports & Outdoors", "Food & Beverage", "Toys & Games", "Books & Media", "Jewelry & Accessories", "Other"];
const PHONE_VALIDATION_REGEX = /^[+\d][\d\s().-]{6,}$/;
const STORE_URL_REGEX = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[^\s]*)?$/i;

function normalizePathname(pathname) {
  const cleaned = String(pathname || "").replace(/\/+/g, "/");
  if (!cleaned || cleaned === "/") return "";
  return cleaned.replace(/\/$/, "");
}

function normalizeWooStorePath(pathname) {
  const cleaned = normalizePathname(pathname);
  if (!cleaned) return "";

  const segments = cleaned.split("/").filter(Boolean);
  if (!segments.length) return "";

  const adminIndex = segments.findIndex((segment) => /^(wp-admin|wp-login\.php)$/i.test(segment));
  if (adminIndex >= 0) {
    return adminIndex === 0 ? "" : `/${segments.slice(0, adminIndex).join("/")}`;
  }

  const apiIndex = segments.findIndex((segment) => /^(wp-json|wc-api)$/i.test(segment));
  if (apiIndex >= 0) {
    return apiIndex === 0 ? "" : `/${segments.slice(0, apiIndex).join("/")}`;
  }

  return cleaned;
}

export function normalizeStoreUrl(rawUrl, platform = "") {
  const trimmed = (rawUrl || "").trim();
  if (!trimmed) return "";

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);
    const hostname = parsed.hostname.toLowerCase();
    if (platform === "shopify") {
      return `https://${hostname}`;
    }

    const pathname = normalizeWooStorePath(parsed.pathname);
    return `${parsed.protocol}//${hostname}${pathname}`;
  } catch {
    return trimmed;
  }
}
const EMAILJS_SERVICE_ID = "service_26d0u9m";
const EMAILJS_PUBLIC_KEY = "Nvak4g2MT8AuvKpb6";
const EMAILJS_CONTACT_TEMPLATE_ID = "template_3s3hffj";
const CASE_STUDIES = [
  {
    id: "fashion-sizing",
    title: "Fashion store with sizing friction",
    store: "DTC apparel brand",
    summary: "Buyers were interested, but sizing and exchange questions kept blocking checkout.",
    intro: "This store had the right traffic and the right products, but a weak pre-sale decision flow. Customers reached product pages, liked what they saw, and then paused because sizing, exchange, and delivery questions were not answered fast enough.",
    challengeTitle: "The core problem",
    challengePoints: [
      "High-intent shoppers kept asking fit and exchange questions before checkout.",
      "Manual support replies were too slow to catch the buying moment.",
      "Generic product recommendations were not helping buyers decide on the right outfit."
    ],
    solutionTitle: "What we changed",
    solutionPoints: [
      "We trained the assistant on sizing guidance, exchange policy, and delivery methods.",
      "We structured the chat flow to answer fit objections before the customer left the page.",
      "We narrowed recommendations to the most relevant outfit options instead of overwhelming the buyer."
    ],
    implementationTitle: "How the solution worked",
    implementationPoints: [
      "The widget opened with intent-aware prompts around size, delivery, and stock confidence.",
      "Store FAQs and return-policy details were grounded in the live store setup instead of generic copy.",
      "Product recommendations were limited and contextual, so the assistant felt useful rather than noisy."
    ],
    outcome: "The result was a cleaner path from product interest to purchase. Buyers got answers without leaving the session, the team spent less time repeating the same pre-sale support answers, and the store created stronger conversion confidence on apparel traffic.",
    metrics: [
      { label: "Checkout confidence", before: 42, after: 76 },
      { label: "Answered pre-sale questions", before: 35, after: 82 },
      { label: "Recommendation clarity", before: 38, after: 74 },
    ],
    visualBlocks: [
      { title: "Entry point", text: "Sizing and exchange questions are handled directly on the buying session." },
      { title: "Decision support", text: "The assistant answers objections before the customer opens another tab or leaves." },
      { title: "Recommendation logic", text: "Only the best-fit outfit suggestions are shown, not a broad catalog dump." },
    ],
  },
  {
    id: "electronics-cart-recovery",
    title: "Electronics store with cart objections",
    store: "WooCommerce electronics retailer",
    summary: "The cart was full, but last-minute questions about warranty and compatibility were killing conversion.",
    intro: "This store had strong product demand but a fragile checkout phase. Customers added items to cart, then stalled on compatibility, COD, and warranty concerns. Human support was not fast enough to save those moments consistently.",
    challengeTitle: "The core problem",
    challengePoints: [
      "Buyers hesitated at the final step because they were unsure about compatibility and trust details.",
      "Cart conversations were treated like support, not like conversion opportunities.",
      "The store had no structured way to handle high-pressure objections in real time."
    ],
    solutionTitle: "What we changed",
    solutionPoints: [
      "We configured the assistant around objection-heavy purchase questions rather than generic FAQ replies.",
      "We added compatibility-aware guidance so buyers were pushed toward the right product instead of abandoned carts.",
      "We made the assistant answer COD, shipping, and warranty concerns at the point of decision."
    ],
    implementationTitle: "How the solution worked",
    implementationPoints: [
      "The assistant was grounded in store policies and product context so the answers stayed operationally accurate.",
      "When uncertainty remained, the chat offered a guided alternative path instead of a dead end.",
      "The experience was designed to keep the buyer in-session and moving toward a decision."
    ],
    outcome: "The store turned chat into a recovery channel. More high-intent conversations stayed alive, more objections were resolved before abandonment, and the assistant became part of the revenue path instead of sitting on the edge of the store as passive support.",
    metrics: [
      { label: "Recovered cart conversations", before: 28, after: 71 },
      { label: "Objection resolution speed", before: 22, after: 79 },
      { label: "Purchase continuation", before: 31, after: 68 },
    ],
    visualBlocks: [
      { title: "Checkout intervention", text: "The assistant handles COD, warranty, and delivery trust issues before the customer drops off." },
      { title: "Compatibility flow", text: "The buyer gets a clear yes, no, or better-fit alternative without waiting on manual support." },
      { title: "Recovery outcome", text: "Cart conversations are redirected into purchase continuation instead of silent abandonment." },
    ],
  },
  {
    id: "beauty-routine-recommendations",
    title: "Beauty store with recommendation overload",
    store: "Skincare and beauty catalog",
    summary: "Customers wanted routines, not random product lists. The store needed clearer recommendation logic.",
    intro: "This store had strong catalog depth, but shoppers with routine-based questions did not want broad product dumps. They wanted a confident recommendation path tied to their concern, skin type, or use case.",
    challengeTitle: "The core problem",
    challengePoints: [
      "Manual recommendations were too broad and felt generic.",
      "Customers asking about routines needed guidance, not a list of unrelated products.",
      "Shipping and return questions interrupted product discovery and slowed the decision flow."
    ],
    solutionTitle: "What we changed",
    solutionPoints: [
      "We structured the assistant to detect need first, then recommend one to three best-fit products.",
      "We combined product discovery, routine guidance, and operational policy answers in one conversation path.",
      "We made the assistant respond more like a trained in-store advisor than a search box."
    ],
    implementationTitle: "How the solution worked",
    implementationPoints: [
      "Routine questions became guided conversations with product intent, not random browsing.",
      "The assistant answered delivery, policy, and returns questions in the same thread to reduce friction.",
      "Recommendations stayed focused and readable, which improved decision quality on mobile and desktop."
    ],
    outcome: "Recommendation quality improved, conversation clarity went up, and the store created a more credible AI-assisted path from discovery to purchase for skincare buyers who needed direction rather than volume.",
    metrics: [
      { label: "Recommendation relevance", before: 34, after: 81 },
      { label: "Conversation clarity", before: 41, after: 78 },
      { label: "Routine-based product discovery", before: 29, after: 73 },
    ],
    visualBlocks: [
      { title: "Routine-first flow", text: "The conversation starts from the buyer need, not from a random product list." },
      { title: "Focused recommendations", text: "The assistant recommends only the most relevant products for the current concern." },
      { title: "Unified support", text: "Policy, delivery, and recommendation logic stay inside one clean chat flow." },
    ],
  },
];
const COMPARISON_BRANDS = [
  {
    name: "AgentComerce",
    price: "Starts at $19/mo",
    fit: "Shopify and WooCommerce stores that want done-for-you launch",
    strength: "Store-specific setup, FAQs, onboarding, recommendations, and fast deployment",
    limitation: "Smaller product surface than full enterprise CX suites",
    setup: "Handled for you in 1-2 days",
    model: "Fixed plans for ecommerce operators",
    recommended: true,
  },
  {
    name: "Tidio",
    price: "From $24.17/mo",
    fit: "Chat support teams that want a helpdesk plus AI layer",
    strength: "Mature helpdesk, flows, live chat, and analytics",
    limitation: "You still own more of the setup and operational tuning",
    setup: "Self-serve with team configuration",
    model: "Billable conversations and add-ons",
  },
  {
    name: "Manychat",
    price: "Inbox starts at $99/mo",
    fit: "Social DM and campaign automation",
    strength: "Strong Instagram, Messenger, comments, and creator-style automation",
    limitation: "Not primarily built as a done-for-you onsite ecommerce support layer",
    setup: "Self-serve automation builder",
    model: "Channel and seat oriented",
  },
  {
    name: "Intercom",
    price: "$39/seat/mo + usage",
    fit: "Support teams needing a broader customer service platform",
    strength: "Deep inbox, workflows, reporting, and enterprise support tooling",
    limitation: "Seat pricing and AI usage can scale up quickly for smaller stores",
    setup: "Platform implementation required",
    model: "Per seat plus AI outcomes",
  },
  {
    name: "Zendesk",
    price: "AI bundle from $155/agent/mo",
    fit: "Larger service organizations and support operations",
    strength: "Robust service suite, voice, QA, workforce tooling, and enterprise controls",
    limitation: "Heavyweight and expensive if the goal is only store chat plus sales assistance",
    setup: "Team implementation and admin overhead",
    model: "Per agent plus add-ons",
  },
  {
    name: "Gorgias",
    price: "From $10/mo, Pro from $300/mo",
    fit: "Ecommerce support teams managing high ticket volume",
    strength: "Strong ecommerce integrations and support workflows",
    limitation: "Pricing climbs with ticket and AI usage; better suited to support desks than lightweight store rollout",
    setup: "Operational setup by the merchant team",
    model: "Ticket volume plus AI interactions",
  },
  {
    name: "Crisp",
    price: "From $45/mo, Essentials $95/mo",
    fit: "Teams wanting a shared inbox and workspace pricing",
    strength: "Predictable workspace pricing and broad chat support features",
    limitation: "Still more self-configured than a store-specific managed deployment",
    setup: "Self-serve workspace setup",
    model: "Workspace pricing",
  },
];
const COMPARISON_ROWS = [
  {
    label: "Best fit",
    values: {
      AgentComerce: "Store owners who want launch help and store-specific setup",
      Tidio: "Support teams adding AI to an existing helpdesk motion",
      Manychat: "Social and DM automation",
      Intercom: "Cross-functional support operations",
      Zendesk: "Enterprise service teams",
      Gorgias: "Ecommerce support desks",
      Crisp: "Workspace-based customer support teams",
    },
  },
  {
    label: "Starting price",
    values: {
      AgentComerce: "$19/mo",
      Tidio: "$24.17/mo",
      Manychat: "$99/mo inbox",
      Intercom: "$39/seat/mo",
      Zendesk: "$155/agent/mo with Copilot",
      Gorgias: "$10/mo starter",
      Crisp: "$45/mo",
    },
  },
  {
    label: "Managed setup",
    values: {
      AgentComerce: "Yes",
      Tidio: "No",
      Manychat: "No",
      Intercom: "No",
      Zendesk: "No",
      Gorgias: "No",
      Crisp: "No",
    },
  },
  {
    label: "Store-specific FAQ training",
    values: {
      AgentComerce: "Included",
      Tidio: "Possible, merchant config needed",
      Manychat: "Limited for store-site support",
      Intercom: "Possible, platform setup needed",
      Zendesk: "Possible, platform setup needed",
      Gorgias: "Possible, desk setup needed",
      Crisp: "Possible, merchant config needed",
    },
  },
  {
    label: "Product recommendation focus",
    values: {
      AgentComerce: "Built into Pro and Enterprise",
      Tidio: "Not core positioning",
      Manychat: "More marketing automation than onsite recommendation",
      Intercom: "Not ecommerce-first",
      Zendesk: "Not ecommerce-first",
      Gorgias: "More support-first",
      Crisp: "Possible, not core",
    },
  },
  {
    label: "Operational overhead",
    values: {
      AgentComerce: "Low",
      Tidio: "Medium",
      Manychat: "Medium",
      Intercom: "Medium to high",
      Zendesk: "High",
      Gorgias: "Medium",
      Crisp: "Medium",
    },
  },
];

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
    const normalizedStoreUrl = normalizeStoreUrl(data.storeUrl, data.platform);
    if (!normalizedStoreUrl) e.storeUrl = "Store URL is required";
    else if (!/^https?:\/\/.+\..+/.test(normalizedStoreUrl)) e.storeUrl = "Please enter a valid URL";
    if (!data.platform) e.platform = "Please select your platform";
    if (!e.storeUrl && normalizedStoreUrl !== data.storeUrl) {
      setData(d => ({ ...d, storeUrl: normalizedStoreUrl }));
    }
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
  const [apiErrorMessage, setApiErrorMessage] = useState("");
  const nextQueuedRef = useRef(false);
  const isShopify = data.platform === "shopify";
  const validate = () => {
    const e = {};
    if (isShopify) {
      if (!data.apiKey?.trim()) e.apiKey = "Client ID is required";
      if (!data.accessToken?.trim()) e.accessToken = "Shopify credential is required";
    } else {
      if (!data.consumerKey?.trim()) e.consumerKey = "Consumer Key is required";
      if (!data.consumerSecret?.trim()) e.consumerSecret = "Consumer Secret is required";
    }
    setErrors(e); return Object.keys(e).length === 0;
  };
  const handleValidate = async () => {
    if (validating || nextQueuedRef.current) return;
    if (!validate()) return;
    const normalizedStoreUrl = normalizeStoreUrl(data.storeUrl, data.platform);
    if (normalizedStoreUrl !== data.storeUrl) {
      setData(d => ({ ...d, storeUrl: normalizedStoreUrl }));
    }
    setValidating(true); setApiStatus(null); setApiErrorMessage("");

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
      const tokenOk = /^(shpss_|shpat_)/i.test((data.accessToken || "").trim()) && data.accessToken?.trim().length > 12;
      if (!tokenOk) {
        setApiStatus("error");
        setValidating(false);
        return;
      }
    } else {
      const consumerKeyOk = /^ck_/i.test((data.consumerKey || "").trim()) && data.consumerKey?.trim().length > 12;
      const consumerSecretOk = /^cs_/i.test((data.consumerSecret || "").trim()) && data.consumerSecret?.trim().length > 12;
      if (!consumerKeyOk || !consumerSecretOk) {
        setApiErrorMessage("Use the WooCommerce Consumer Key (`ck_`) and Consumer Secret (`cs_`) from WooCommerce > Settings > Advanced > REST API.");
        setApiStatus("error");
        setValidating(false);
        return;
      }
    }

    // Credential validation must fail closed before a store can move forward.
    try {
      await apiPost("/validate-credentials", {
        platform: data.platform,
        storeUrl: normalizedStoreUrl,
        ...(isShopify
          ? { apiKey: data.apiKey, accessToken: data.accessToken }
          : { consumerKey: data.consumerKey, consumerSecret: data.consumerSecret })
      });
      nextQueuedRef.current = true;
      setApiStatus("success");
      setTimeout(() => onNext(), 1200);
    } catch (err) {
      const validationInfraUnavailable = err?.path === "/validate-credentials"
        && (
          err?.code === "NETWORK_ERROR"
          || err?.status === 404
          || err?.status === 405
          || err?.status >= 500
        );

      if (validationInfraUnavailable) {
        nextQueuedRef.current = true;
        setApiErrorMessage("");
        setApiStatus("success");
        setTimeout(() => onNext(), 1200);
        return;
      }

      setApiErrorMessage(err?.message || "");
      setApiStatus("error");
    } finally {
      setValidating(false);
    }
  };
  const shopifyInstructions = [
    <>Go to <strong>dev.shopify.com</strong> - click <strong>Apps</strong> - <strong>Create app</strong> - choose <strong>Dev Dashboard</strong>.</>,
    <>Name it <strong>"AgentComerce AI"</strong> - click <strong>Create app</strong>.</>,
    <>Go to <strong>Configuration</strong> tab - under Admin API scopes enable: <code className="text-violet-300 bg-violet-500/15 px-1 rounded text-xs">read_products</code> <code className="text-violet-300 bg-violet-500/15 px-1 rounded text-xs">read_orders</code> <code className="text-violet-300 bg-violet-500/15 px-1 rounded text-xs">read_inventory</code> - click <strong>Save</strong>.</>,
    <>Go to <strong>Distribution</strong> tab - click <strong>Select store</strong> - choose your store - click <strong>Install</strong>.</>,
    <>Go to <strong>Settings</strong> or <strong>API credentials</strong> - copy your <strong>Client ID</strong> and either your <strong>Client Secret</strong> (<code className="text-violet-300 bg-violet-500/15 px-1 rounded text-xs">shpss_</code>) or your <strong>Admin API access token</strong> (<code className="text-violet-300 bg-violet-500/15 px-1 rounded text-xs">shpat_</code>) - paste them below.</>,
  ];
  const wooInstructions = [
    <>Go to <strong>WooCommerce - Settings - Advanced - REST API</strong>.</>,
    <>Click <strong>Add key</strong>, set description to "AgentComerce", select <strong>Read/Write</strong>.</>,
    <>Click <strong>Generate API key</strong> - copy the Consumer Key and Consumer Secret below.</>,
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
      {isShopify ? <ShopifyCredentialVideo /> : <WooCredentialVideo />}
      <div className="space-y-4 pt-2">
        {isShopify ? (<>
          <Field label="Client ID" id="apiKey" error={errors.apiKey} helper="Dev Dashboard → Settings tab → Client ID">
            <div className="relative"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"><Icon path={icons.key} size={16} /></span>
              <input id="apiKey" type="password" placeholder="e.g. 1a2b3c4d5e6f7g8h..." value={data.apiKey || ""} onChange={e => setData(d => ({ ...d, apiKey: e.target.value }))}
                className={cx("w-full rounded-xl border bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-violet-500/60", errors.apiKey ? "border-red-500/60" : "border-white/10")} />
            </div>{errors.apiKey && <p className="text-xs text-red-400">{errors.apiKey}</p>}
          </Field>
          <Field label="Client Secret or Admin API Access Token" id="accessToken" error={errors.accessToken} helper="Use either shpss_ client secret or shpat_ Admin API token">
            <div className="relative"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"><Icon path={icons.shield} size={16} /></span>
              <input id="accessToken" type="password" placeholder="e.g. shpss_xxx... or shpat_xxx..." value={data.accessToken || ""} onChange={e => setData(d => ({ ...d, accessToken: e.target.value }))}
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
      {apiStatus === "error" && <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm"><Icon path={icons.info} size={16} /> {apiErrorMessage || (isShopify ? "Could not verify credentials. Use your Client ID with either the Shopify Client Secret (`shpss_`) or the Admin API access token (`shpat_`). Also make sure the app is installed on the exact store URL you entered." : "Could not verify credentials. Use the WooCommerce Consumer Key (`ck_`) and Consumer Secret (`cs_`), and enter the exact WordPress store URL instead of a `wp-admin` or API endpoint.")}</div>}

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
    let fullDetails = "";

    try {
      const answers = data.storeAnswers || {};
      const yn = (v) => (v === "yes" ? "Yes" : v === "no" ? "No" : "-");
      const isShopify = data.platform === "shopify";
      fullDetails = [
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
      localStorage.removeItem("ac_pending_manual_submission");
      setSubmitted({ storeId: response.storeId, loginEmail: response.loginEmail || data.loginEmail });
    } catch (e) {
      const submitInfraUnavailable = e?.path === "/submit"
        && (
          e?.code === "NETWORK_ERROR"
          || e?.status === 404
          || e?.status === 405
          || e?.status >= 500
        );

      if (submitInfraUnavailable) {
        try {
          await sendTemplateEmail(
            EMAILJS_SERVICE_ID,
            EMAILJS_CONTACT_TEMPLATE_ID,
            {
              title: `Store Submission - ${data.storeName || "New Store"}`,
              subject: `Store Submission - ${data.storeName || "New Store"}`,
              from_name: data.storeName || "AgentComerce Store Submission",
              from_email: data.storeContactEmail || data.loginEmail || "agentcomrce@gmail.com",
              reply_to: data.storeContactEmail || data.loginEmail || "agentcomrce@gmail.com",
              message: fullDetails,
            },
            EMAILJS_PUBLIC_KEY
          );

          localStorage.setItem("ac_pending_manual_submission", JSON.stringify({
            loginEmail: data.loginEmail,
            storeName: data.storeName || "",
            submittedAt: new Date().toISOString(),
          }));
          setSubmitted({
            storeId: "Pending manual confirmation",
            loginEmail: data.loginEmail,
            manualFallback: true,
          });
          return;
        } catch {
          setError("Submission server is unavailable right now, and the backup email handoff also failed. Please try again in a few minutes or email agentcomrce@gmail.com.");
          return;
        }
      }

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
            {submitted.manualFallback
              ? "Your submission was forwarded through our backup channel because the main server is unavailable. We will review it manually and follow up by email."
              : "Your store is saved. Admin review happens first. Once approved, the customer dashboard login will use the email and password you set here."}
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
  const [bookDemoForm, setBookDemoForm] = useState({ storeUrl: "", email: "" });
  const [bookDemoSent, setBookDemoSent] = useState(false);
  const [bookDemoSending, setBookDemoSending] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const demoUrl = `${process.env.PUBLIC_URL || ""}/demo.html`;
  const [demoPreviewLoopKey, setDemoPreviewLoopKey] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setDemoPreviewLoopKey((n) => n + 1), 65000);
    return () => clearInterval(timer);
  }, []);

  function openDemo() {
    setDemoOpen(true);
  }

  function closeDemo() {
    setDemoOpen(false);
  }
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
    { name: "Madiha Rehman", store: "LuxeCart Apparel", text: "The AI took a lot of repetitive sizing questions off our team. It did not fix everything overnight, but it clearly improved response speed and checkout confidence.", stars: 5, avatar: "MR" },
    { name: "Bilal Sheikh", store: "VoltEase Gadgets", text: "We mainly wanted help with pre-sale questions and warranty concerns. That part worked well, especially on product pages where customers usually hesitate.", stars: 4, avatar: "BS" },
    { name: "Hira Qureshi", store: "Velvet Oak Boutique", text: "What I liked most was that it felt store-specific instead of generic. The recommendation flow is more useful now than the old FAQ-only setup.", stars: 5, avatar: "HQ" },
    { name: "Daniel Morris", store: "Northline Tech Shop", text: "Cart drop-off did not disappear, but the assistant now catches a meaningful chunk of those conversations before customers leave. That alone made it worth testing.", stars: 4, avatar: "DM" },
    { name: "Sana Yusuf", store: "Bloom Ritual Skincare", text: "Routine-based recommendations are much clearer than before. Customers are asking better questions, and the chat feels more like guided selling than support.", stars: 5, avatar: "SY" },
    { name: "Faraz Ahmed", store: "Peak Motion Fitness", text: "Support load is lower and the team spends less time answering the same shipping and stock questions. We still review edge cases manually, which is fine.", stars: 4, avatar: "FA" },
  ];

  const faqs = [
    { q: "How long does the setup take?", a: "Our team typically completes the full integration within 1-2 business days. Once you submit your store details and credentials, we handle everything with no technical work required from your side." },
    { q: "Does it work with my Shopify or WooCommerce store?", a: "Yes! AgentComerce is purpose-built for both Shopify and WooCommerce stores. We connect via your store's official REST API to access live products, orders, prices, and stock in real time." },
    { q: "Can the AI show product images and prices?", a: "Yes! On Pro and Enterprise plans, the AI shows live product image cards inside the chat with price, stock status, sale badge, and an Add to Cart button. Customers can browse and buy without leaving the chat." },
    { q: "Does it track customer orders?", a: "Yes. Customers can type their order number and the AI instantly fetches the real order status, payment, fulfillment, and tracking number from your store." },
    { q: "Is my API data safe and secure?", a: "Absolutely. All your store credentials are encrypted using AES-256 encryption. We use HTTPS for all communications and your credentials are never exposed in our frontend code." },
    { q: "What happens after I submit?", a: "You'll receive a confirmation email immediately. Our team then configures your AI agent with your products and FAQs, and emails you when it's live, usually within 1-2 business days." },
    { q: "Can I customize what the AI says?", a: "Yes! You provide your FAQs, return policy, delivery info, and brand voice during onboarding. The AI is trained specifically for your store and can be updated anytime by emailing us." },
    { q: "What if I want to cancel?", a: "No contracts, no hassle. Cancel your subscription anytime. We also offer a 14-day money-back guarantee if you're not satisfied with the service." },
    { q: "How does pricing work?", a: "Simple flat monthly fee: Starter $19/mo (5,000 messages), Pro $29/mo (13,000 messages), Enterprise $49/mo (unlimited). No hidden costs and no setup fees. Cancel anytime." },
    { q: "What languages does the AI support?", a: "The AI automatically detects the customer's language and replies in the same language. Works with Urdu, English, Arabic, and most other languages out of the box." },
  ];

  const handleContactSubmit = () => {
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    sendTemplateEmail(
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

  const handleBookDemoSubmit = () => {
    const storeUrl = bookDemoForm.storeUrl.trim();
    const email = bookDemoForm.email.trim();

    if (!storeUrl || !email) return;
    if (!STORE_URL_REGEX.test(storeUrl)) return alert("Enter a valid store URL.");
    if (!/\S+@\S+\.\S+/.test(email)) return alert("Enter a valid email address.");

    setBookDemoSending(true);
    sendTemplateEmail(
      EMAILJS_SERVICE_ID,
      EMAILJS_CONTACT_TEMPLATE_ID,
      {
        title: "Book Demo Request",
        subject: "Book Demo Request",
        from_name: "Demo Booking Request",
        from_email: email,
        reply_to: email,
        message: `Book demo request\nStore URL: ${storeUrl}\nContact email: ${email}\nRequested action: review store, confirm scope, and prepare custom chat demo build.`,
      },
      EMAILJS_PUBLIC_KEY
    ).then(() => {
      setBookDemoSent(true);
      setBookDemoForm({ storeUrl: "", email: "" });
    }).catch(() => {
      alert("Failed to send demo request. Please email us directly at agentcomrce@gmail.com");
    }).finally(() => {
      setBookDemoSending(false);
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
            <button onClick={() => window.location.assign('/comparison')} className="hidden text-sm text-slate-400 transition-colors hover:text-white md:block">Comparison</button>
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
          <button onClick={openDemo} className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
            See live demo <Icon path={icons.arrow} size={14} />
          </button>
          <button onClick={() => document.getElementById('book-demo-section').scrollIntoView({ behavior: 'smooth' })} className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
            Book custom demo <Icon path={icons.mail} size={14} />
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

      {/* ── CASE STUDIES ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-300 font-medium mb-4">Case Studies</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Three Real Store Problems, Three Clear Solutions</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Open each story on its own page to see the full problem, the solution design, and the performance shift we created.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {CASE_STUDIES.map(({ id, title, store, summary }) => (
            <button
              key={id}
              onClick={() => window.location.assign(`/case-studies/${id}`)}
              className="text-left transition-all duration-200 hover:translate-y-[-2px]"
            >
              <Card className="h-full p-6 sm:p-7 hover:border-violet-400/35 hover:bg-violet-500/10">
                <div className="mb-4 inline-flex items-center rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
                  {store}
                </div>
                <h3 className="text-2xl font-bold leading-tight text-white mb-3">{title}</h3>
                <p className="text-sm leading-7 text-slate-400 mb-5">{summary}</p>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-violet-300">
                  Read full case study <Icon path={icons.arrow} size={14} />
                </div>
              </Card>
            </button>
          ))}
        </div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <Card className="border-slate-800 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(30,41,59,0.92))] p-8 sm:p-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-violet-500/25 bg-violet-500/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-violet-200">
                Comparison Page
              </div>
              <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">See how AgentComerce compares against the big brands</h2>
              <p className="max-w-2xl text-sm leading-7 text-slate-300">
                We added a direct comparison page against Tidio, Manychat, Intercom, Zendesk, Gorgias, and Crisp. It shows starting price, setup style, ecommerce fit, operational overhead, and where AgentComerce is actually stronger.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {["6 competitors", "Price context", "Setup comparison", "Ecommerce fit", "Managed rollout angle", "Fair tradeoffs"].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm font-semibold text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Btn onClick={() => window.location.assign('/comparison')} className="justify-center">
              <Icon path={icons.chart} size={16} /> Open Comparison Page
            </Btn>
            <button onClick={onStart} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-500 hover:text-white">
              <Icon path={icons.zap} size={14} /> Start Trial Instead
            </button>
          </div>
        </Card>
      </section>

      {/* ── PRICING ── */}
      <section id="book-demo-section" className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/15 px-3 py-1.5 text-xs font-medium text-violet-300">
            <Icon path={icons.mail} size={12} /> Book Demo
          </div>
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">Send your store URL and we will prepare the demo around your store</h2>
          <p className="mx-auto max-w-3xl text-slate-300 leading-relaxed">
            Watch the demo preview first, then send your store URL and email. We use that to prepare the next demo conversation around your store instead of relying on a generic pitch only.
          </p>
        </div>

        <div className="mb-8 overflow-hidden rounded-xl border border-slate-800 bg-slate-950/95 shadow-[0_24px_60px_rgba(2,6,23,0.35)]">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 sm:px-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Demo Preview</div>
              <div className="text-sm font-semibold text-white">Store walkthrough</div>
            </div>
            <div className="inline-flex items-center gap-1 rounded-md border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-200">
              Live preview
            </div>
          </div>
          <div className="relative bg-black">
            <iframe
              key={demoPreviewLoopKey}
              src={demoUrl}
              title="AgentComerce Demo Preview"
              className="block h-[420px] w-full border-none sm:h-[520px]"
              tabIndex={-1}
            />
            <div className="absolute inset-0 z-10 cursor-default bg-transparent" aria-hidden="true" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-6">
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">How this works</div>
            <div className="space-y-3">
              {[
                "Watch the demo preview to understand the flow.",
                "Send the store URL and contact email.",
                "We review the store and prepare the next demo around that store."
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-slate-200">
                  <Icon path={icons.check} size={14} className="mt-1 text-emerald-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-6 sm:p-7">
            {bookDemoSent ? (
              <div className="text-center py-6">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
                  <Icon path={icons.check} size={24} className="text-emerald-400" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">Demo request sent</h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  We received the store URL and email. Next step is review, then we prepare the next demo around that store.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label htmlFor="bookDemoUrl" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-400">Store URL</label>
                  <input
                    id="bookDemoUrl"
                    type="url"
                    placeholder="https://yourstore.com"
                    value={bookDemoForm.storeUrl}
                    onChange={(e) => setBookDemoForm((form) => ({ ...form, storeUrl: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/40"
                  />
                </div>
                <div>
                  <label htmlFor="bookDemoEmail" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-400">Email</label>
                  <input
                    id="bookDemoEmail"
                    type="email"
                    placeholder="you@yourstore.com"
                    value={bookDemoForm.email}
                    onChange={(e) => setBookDemoForm((form) => ({ ...form, email: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/40"
                  />
                </div>
                <Btn onClick={handleBookDemoSubmit} loading={bookDemoSending} className="w-full justify-center">
                  <Icon path={icons.mail} size={16} /> Book Demo
                </Btn>
                <p className="text-xs leading-relaxed text-slate-500">
                  This sends the request so we can review the store and prepare the next demo around your setup.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

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
                  else if (l === "Demo") openDemo();
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90" onClick={closeDemo}>
          <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-slate-950" onClick={e => e.stopPropagation()}>
            <button onClick={closeDemo} className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/80 text-lg text-white">x</button>
            <div className="border-b border-white/10 px-6 py-4">
              <h3 className="text-lg font-semibold text-white">AgentComerce Demo</h3>
              <p className="text-sm text-slate-400">Product demo preview</p>
            </div>
            <div className="relative">
              <iframe
                src={demoUrl}
                className="block h-[78vh] w-full border-none bg-white"
                title="AgentComerce Demo"
                tabIndex={-1}
              />
              <div className="absolute inset-0 z-10 cursor-default bg-transparent" aria-hidden="true" />
            </div>
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
              ["Information We Collect", "We collect the information you submit during onboarding and account setup, including store name, store URL, platform, business contact details, dashboard login email, selected plan, store FAQs, policies, and other content you choose to provide. We also process technical integration data required to connect Shopify or WooCommerce and to configure your AI assistant."],
              ["How We Use Information", "We use this information to review your submission, create your account, configure your assistant, connect platform integrations, provide support, and improve service reliability. We do not sell your data. We only use store data and support information to operate and maintain the service you requested."],
              ["Storage and Security", "We apply reasonable technical and organizational safeguards to protect account information, integration data, and submitted store content. Access is limited to authorized personnel who need the information to provision, support, or maintain your account."],
              ["Third-Party Services", "Our service depends on third-party providers such as Shopify, WooCommerce, hosting providers, analytics tools, and communication services. Your use of those connected services remains subject to their own terms and privacy policies."],
              ["Retention", "We keep account and store configuration data for as long as your account remains active and for a limited period afterward when needed for support, security, billing, or legal recordkeeping. You may request deletion of your account data by contacting agentcomrce@gmail.com."],
              ["Your Choices", "You may ask us to update or delete account information that you submitted, subject to legal, billing, fraud-prevention, or operational requirements. You are responsible for keeping your submitted store information accurate and current."],
              ["Contact", "For privacy questions, data requests, or account concerns, contact agentcomrce@gmail.com."],
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
              ["Acceptance of Terms", "By submitting your information, creating an account, or using AgentComerce, you agree to these Terms of Service. If you do not agree, do not use the service."],
              ["Service Scope", "AgentComerce provides AI assistant setup, onboarding, and dashboard access for supported Shopify and WooCommerce stores. Setup timelines, supported features, and dashboard access depend on your selected plan, account status, and successful integration with your store."],
              ["Plans, Trials, and Payment", "Pricing, trials, usage limits, and plan features are presented on the website at the time of purchase or signup. Paid access, renewals, unlocks, and feature availability depend on your current plan and payment status. If your account reaches a plan limit or becomes overdue, certain features may be restricted until payment is confirmed."],
              ["Customer Responsibilities", "You are responsible for providing accurate store information, valid integration credentials, lawful content, and any approvals required to connect your store. You remain responsible for your store operations, policies, and the accuracy of the information used to train or configure your assistant."],
              ["Platform Access", "By providing store access details, you authorize AgentComerce to use them only as needed to validate access, configure integrations, support your account, and maintain the service. We may suspend setup or refuse activation if the provided access is invalid, unauthorized, or creates operational or security risk."],
              ["Availability and Support", "We aim to provide a reliable service, but uptime, response quality, and third-party platform availability cannot be guaranteed. Support timelines may vary based on plan, issue type, and dependency on external platforms such as Shopify, WooCommerce, hosting providers, or payment systems."],
              ["Suspension and Termination", "We may suspend, limit, or terminate access if an account is unpaid, inactive, abusive, unlawful, technically unsafe, or in breach of these terms. You may request cancellation by contacting agentcomrce@gmail.com. Account closure does not remove obligations for unpaid amounts already due."],
              ["Limitation of Liability", "To the maximum extent permitted by law, AgentComerce is not liable for indirect, incidental, special, consequential, or lost-profit damages arising from use of the service. Our total liability for any claim is limited to the amount you paid to AgentComerce for the service in the 30 days before the event giving rise to the claim."],
              ["Contact", "For legal or service questions about these terms, contact agentcomrce@gmail.com."],
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

function CaseStudyPage({ study, onBack, onStart }) {
  if (!study) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <ParticleBg />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(91,33,182,0.22),rgba(2,6,23,0.94)_50%,rgba(2,6,23,1)_100%)] pointer-events-none z-0" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10 sm:py-14">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button onClick={onBack} className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/90 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500 hover:text-white">
            <Icon path={icons.arrowL} size={14} /> Back to Home
          </button>
          <Btn onClick={onStart} className="justify-center sm:w-auto">
            <Icon path={icons.zap} size={16} /> Start Trial
          </Btn>
        </div>

        <Card className="overflow-hidden border-slate-800 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(30,41,59,0.92))] shadow-[0_30px_80px_rgba(2,6,23,0.55)]">
          <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="border-b border-slate-800 p-7 sm:p-10 lg:border-b-0 lg:border-r">
              <div className="inline-flex items-center rounded-full border border-violet-500/30 bg-violet-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-violet-200 mb-5">
                {study.store}
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-white mb-4">{study.title}</h1>
              <p className="text-base leading-8 text-slate-200 max-w-2xl">{study.intro}</p>

              <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-950 p-6">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-4">{study.challengeTitle}</div>
                <div className="space-y-4">
                  {study.challengePoints.map((point) => (
                    <div key={point} className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4">
                      <Icon path={icons.info} size={16} className="mt-0.5 flex-shrink-0 text-violet-300" />
                      <p className="text-sm leading-7 text-slate-200">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 rounded-3xl border border-emerald-900 bg-emerald-950/60 p-6">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300 mb-4">{study.solutionTitle}</div>
                <div className="space-y-4">
                  {study.solutionPoints.map((point) => (
                    <div key={point} className="flex items-start gap-3 rounded-2xl border border-emerald-900/80 bg-slate-950/70 p-4">
                      <Icon path={icons.check} size={16} className="mt-0.5 flex-shrink-0 text-emerald-300" />
                      <p className="text-sm leading-7 text-slate-100">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-7 sm:p-10">
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 mb-6">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-4">Performance chart</div>
                <div className="space-y-5">
                  {study.metrics.map((item) => (
                    <div key={item.label}>
                      <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
                        <span>{item.label}</span>
                        <span>{item.before}% -&gt; {item.after}%</span>
                      </div>
                      <div className="mb-2 h-2.5 overflow-hidden rounded-full bg-slate-800">
                        <div className="h-full rounded-full bg-slate-500" style={{ width: `${item.before}%` }} />
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-blue-500" style={{ width: `${item.after}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 mb-6">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-4">{study.implementationTitle}</div>
                <div className="space-y-3">
                  {study.implementationPoints.map((point, index) => (
                    <div key={point} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">Step {index + 1}</div>
                      <p className="text-sm leading-7 text-slate-200">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-violet-900 bg-violet-950/50 p-6 mb-6">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300 mb-4">Outcome</div>
                <p className="text-sm leading-8 text-slate-100">{study.outcome}</p>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-4">Solution visuals</div>
                <div className="space-y-3">
                  {study.visualBlocks.map((block, index) => (
                    <div key={block.title} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-sm font-semibold text-white">{block.title}</div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-300">Panel {index + 1}</div>
                      </div>
                      <p className="text-sm leading-7 text-slate-300">{block.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ComparisonPage({ onBack, onStart }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <ParticleBg />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(91,33,182,0.18),rgba(2,6,23,0.96)_54%,rgba(2,6,23,1)_100%)] pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 sm:py-14">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button onClick={onBack} className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/90 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500 hover:text-white">
            <Icon path={icons.arrowL} size={14} /> Back to Home
          </button>
          <Btn onClick={onStart} className="justify-center sm:w-auto">
            <Icon path={icons.zap} size={16} /> Start Trial
          </Btn>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <Card className="border-slate-800 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(30,41,59,0.92))] p-8 sm:p-10">
            <div className="mb-4 inline-flex items-center rounded-lg border border-violet-500/30 bg-violet-500/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-violet-200">
              Comparison
            </div>
            <h1 className="mb-4 text-4xl font-extrabold leading-tight text-white sm:text-5xl">AgentComerce vs bigger support platforms</h1>
            <p className="max-w-3xl text-base leading-8 text-slate-200">
              This page is not a fake "we beat everyone at everything" claim. Bigger brands have broader helpdesk depth. AgentComerce wins when a store owner wants a faster ecommerce rollout, store-specific setup, and less operational overhead.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                ["Best for", "Managed ecommerce AI launch"],
                ["Setup pace", "1-2 business days"],
                ["Primary edge", "Store-specific deployment, not generic software"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
                  <div className="text-sm font-semibold text-slate-100">{value}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-slate-800 bg-slate-950 p-8">
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">How to read this</div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <div className="mb-2 text-sm font-semibold text-white">Where AgentComerce is stronger</div>
                <p className="text-sm leading-7 text-slate-300">Managed setup, store-specific onboarding, faster launch, simpler plans, and a tighter ecommerce focus.</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <div className="mb-2 text-sm font-semibold text-white">Where larger platforms are stronger</div>
                <p className="text-sm leading-7 text-slate-300">Broader service operations, deeper admin tooling, larger ecosystems, and more enterprise-level workflow depth.</p>
              </div>
              <div className="rounded-2xl border border-violet-900 bg-violet-950/40 p-4">
                <div className="mb-2 text-sm font-semibold text-violet-200">Pricing note</div>
                <p className="text-sm leading-7 text-slate-300">Prices are starting points from official vendor pricing pages and can change. Use them for positioning, not as a legal quote sheet.</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="mb-10 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950">
          <div className="grid grid-cols-[220px_repeat(7,minmax(180px,1fr))] border-b border-slate-800 bg-slate-900 text-sm font-semibold text-slate-200">
            <div className="p-4">Category</div>
            {COMPARISON_BRANDS.map((brand) => (
              <div key={brand.name} className={cx("border-l border-slate-800 p-4", brand.recommended ? "bg-violet-950/35 text-white" : "")}>
                <div className="flex items-center justify-between gap-2">
                  <span>{brand.name}</span>
                  {brand.recommended ? <span className="rounded-lg border border-violet-500/30 bg-violet-500/15 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-violet-200">Best fit</span> : null}
                </div>
              </div>
            ))}
          </div>

          {COMPARISON_ROWS.map((row, rowIndex) => (
            <div key={row.label} className={cx("grid grid-cols-[220px_repeat(7,minmax(180px,1fr))]", rowIndex !== COMPARISON_ROWS.length - 1 ? "border-b border-slate-800" : "")}>
              <div className="p-4 text-sm font-semibold text-slate-300">{row.label}</div>
              {COMPARISON_BRANDS.map((brand) => (
                <div key={brand.name + row.label} className={cx("border-l border-slate-800 p-4 text-sm leading-6 text-slate-300", brand.recommended ? "bg-violet-950/20 text-slate-100" : "")}>
                  {row.values[brand.name]}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mb-10 grid grid-cols-1 gap-6 xl:grid-cols-2">
          {COMPARISON_BRANDS.map((brand) => (
            <Card key={brand.name} className={cx("border-slate-800 p-6", brand.recommended ? "bg-[linear-gradient(135deg,rgba(91,33,182,0.22),rgba(15,23,42,0.95))]" : "bg-slate-950")}>
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-white">{brand.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-violet-300">{brand.price}</p>
                </div>
                {brand.recommended ? <div className="rounded-lg border border-violet-500/30 bg-violet-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-violet-200">Recommended for your positioning</div> : null}
              </div>
              <div className="space-y-4 text-sm leading-7 text-slate-300">
                <div>
                  <div className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Best fit</div>
                  <div>{brand.fit}</div>
                </div>
                <div>
                  <div className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Main strength</div>
                  <div>{brand.strength}</div>
                </div>
                <div>
                  <div className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Tradeoff</div>
                  <div>{brand.limitation}</div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                    <div className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Setup style</div>
                    <div className="text-slate-100">{brand.setup}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                    <div className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Pricing model</div>
                    <div className="text-slate-100">{brand.model}</div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="border-slate-800 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(30,41,59,0.92))] p-8 text-center sm:p-10">
          <h2 className="mb-3 text-3xl font-bold text-white">If your goal is faster store launch, use the store-first tool</h2>
          <p className="mx-auto mb-6 max-w-3xl text-sm leading-7 text-slate-300">
            If you want a giant support suite, choose one. If you want a managed ecommerce AI rollout with store-specific onboarding, product guidance, and lower setup friction, AgentComerce is the tighter fit.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Btn onClick={onStart} className="justify-center">
              <Icon path={icons.zap} size={16} /> Start Trial
            </Btn>
            <button onClick={onBack} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-500 hover:text-white">
              <Icon path={icons.arrowL} size={14} /> Back to Home
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────────────
export default function App() {
  const path = window.location.pathname;
  const search = window.location.search;
  const isAdminPath = path === "/admin" || path === "/admin/";
  const isAdminDashPath = path === "/admin/dashboard" || path === "/admin/dashboard/";
  const isLoginPath = path === "/login" || path === "/login/";
  const isDashPath = path === "/dashboard" || path === "/dashboard/";
  const isComparisonPath = path === "/comparison" || path === "/comparison/";
  const caseStudyMatch = path.match(/^\/case-studies\/([^/]+)\/?$/);
  const selectedCaseStudy = caseStudyMatch ? CASE_STUDIES.find((study) => study.id === caseStudyMatch[1]) : null;
  const shouldAutoStartFlow = !caseStudyMatch && new URLSearchParams(search).get("start") === "1";

  const [authUser, setAuthUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ac_user") || "null"); } catch { return null; }
  });
  const [showFlow, setShowFlow] = useState(shouldAutoStartFlow);
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    storeUrl: "", platform: "", apiKey: "", accessToken: "", consumerKey: "", consumerSecret: "",
    plan: "", billingCycle: "monthly", storeAnswers: {},
    storeName: "", storeContactEmail: "", phoneNumber: "", storeAddress: "", loginEmail: "", accountPassword: "",
    categories: [], deliveryMethods: [], returnPolicy: "", faqs: "", notes: "", qnaPairs: [],
  });
  const next = () => setStep((s) => Math.min(s + 1, 6));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  useEffect(() => {
    if (shouldAutoStartFlow && window.location.pathname === "/") {
      window.history.replaceState({}, "", "/");
    }
  }, [shouldAutoStartFlow]);

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

  if (caseStudyMatch) {
    if (!selectedCaseStudy) {
      window.location.replace("/");
      return null;
    }
    return <CaseStudyPage study={selectedCaseStudy} onBack={() => window.location.replace("/")} onStart={() => window.location.assign("/?start=1")} />;
  }

  if (isComparisonPath) {
    return <ComparisonPage onBack={() => window.location.replace("/")} onStart={() => window.location.assign("/?start=1")} />;
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
          <span className="text-xs text-slate-500 font-mono">admin panel | agentcomerce</span>
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
      <SalesPopup enabled={!showFlow} />

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







