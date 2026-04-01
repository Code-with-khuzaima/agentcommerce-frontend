// ─────────────────────────────────────────────────────────────
// SalesPopup.js — Drop this file in your /src folder
// Then import and add <SalesPopup /> anywhere inside your App
// It auto-shows after 8 seconds on first visit (once per session)
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

const PDF_URL = "https://your-cdn.com/AI_Chatbot_Sales_Research.pdf";
// ↑ Upload the PDF to your Vercel /public folder and update this URL

const STATS = [
  { value: "67%", label: "Average sales increase", color: "#a855f7" },
  { value: "40%", label: "Less cart abandonment", color: "#06d6a0" },
  { value: "3×", label: "Higher conversion rate", color: "#f59e0b" },
  { value: "24/7", label: "Automated support", color: "#38bdf8" },
];

const FACTS = [
  { icon: "📈", text: "AI chatbots recover up to 40% of abandoned carts through real-time engagement" },
  { icon: "💰", text: "Stores using AI chat report 25–67% revenue growth within the first 60 days" },
  { icon: "⚡", text: "Sales-focused chatbots achieve 12.3% conversion vs 3.1% without — that's 3× more sales" },
  { icon: "🛒", text: "Average order value increases 10–25% through AI-powered upsells and recommendations" },
];

export default function SalesPopup() {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [activeFact, setActiveFact] = useState(0);

  useEffect(() => {
    // Only show once per session
    if (sessionStorage.getItem("ac_popup_seen")) return;

    const timer = setTimeout(() => {
      setVisible(true);
      sessionStorage.setItem("ac_popup_seen", "1");
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  // Auto-rotate facts every 3 seconds
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setActiveFact((f) => (f + 1) % FACTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [visible]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
    }, 300);
  };

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes ac-popup-in {
          from { opacity: 0; transform: scale(0.92) translateY(20px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes ac-popup-out {
          from { opacity: 1; transform: scale(1)    translateY(0); }
          to   { opacity: 0; transform: scale(0.92) translateY(20px); }
        }
        @keyframes ac-shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes ac-pulse-ring {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes ac-fact-in {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .ac-popup-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
        }
        .ac-popup-box {
          background: #0f0a1e;
          border: 1px solid rgba(168,85,247,0.3);
          border-radius: 20px;
          width: 100%; max-width: 520px;
          box-shadow: 0 0 60px rgba(124,58,237,0.25), 0 24px 64px rgba(0,0,0,0.6);
          animation: ac-popup-in 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;
          overflow: hidden;
          position: relative;
        }
        .ac-popup-box.closing {
          animation: ac-popup-out 0.3s ease forwards;
        }
        .ac-glow-top {
          position: absolute; top: -40px; left: 50%; transform: translateX(-50%);
          width: 300px; height: 100px;
          background: radial-gradient(ellipse at center, rgba(168,85,247,0.4) 0%, transparent 70%);
          pointer-events: none;
        }
        .ac-header {
          background: linear-gradient(135deg, #1a0533 0%, #0f0a1e 60%);
          padding: 20px 24px 16px;
          border-bottom: 1px solid rgba(168,85,247,0.2);
          position: relative;
        }
        .ac-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(168,85,247,0.15);
          border: 1px solid rgba(168,85,247,0.4);
          border-radius: 999px;
          padding: 4px 12px;
          font-size: 11px; font-weight: 700;
          color: #c084fc; letter-spacing: 0.04em;
          margin-bottom: 10px;
        }
        .ac-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #a855f7; position: relative;
        }
        .ac-badge-dot::after {
          content: ''; position: absolute; inset: -3px;
          border-radius: 50%; background: #a855f7;
          animation: ac-pulse-ring 1.5s ease-out infinite;
        }
        .ac-title {
          font-size: 22px; font-weight: 800;
          color: #fff; line-height: 1.25;
          font-family: 'DM Sans', system-ui, sans-serif;
          margin: 0 0 4px;
        }
        .ac-title span { color: #a855f7; }
        .ac-subtitle {
          font-size: 13px; color: #94a3b8; margin: 0;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .ac-close {
          position: absolute; top: 16px; right: 16px;
          width: 28px; height: 28px; border-radius: 8px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: #94a3b8; font-size: 14px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
        }
        .ac-close:hover { background: rgba(255,255,255,0.12); color: white; }
        .ac-stats-grid {
          display: grid; grid-template-columns: 1fr 1fr 1fr 1fr;
          gap: 1px; background: rgba(255,255,255,0.06);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .ac-stat {
          background: #0f0a1e;
          padding: 14px 8px; text-align: center;
        }
        .ac-stat-val {
          font-size: 22px; font-weight: 800;
          font-family: 'DM Sans', system-ui, sans-serif;
          line-height: 1;
        }
        .ac-stat-lbl {
          font-size: 10px; color: #64748b; margin-top: 3px;
          font-family: 'DM Sans', system-ui, sans-serif;
          line-height: 1.3;
        }
        .ac-body { padding: 16px 24px 20px; }
        .ac-fact-box {
          background: rgba(168,85,247,0.06);
          border: 1px solid rgba(168,85,247,0.2);
          border-radius: 12px;
          padding: 12px 14px;
          margin-bottom: 14px;
          min-height: 52px;
          display: flex; align-items: center; gap: 10px;
        }
        .ac-fact-icon { font-size: 20px; flex-shrink: 0; }
        .ac-fact-text {
          font-size: 13px; color: #cbd5e1; line-height: 1.5;
          font-family: 'DM Sans', system-ui, sans-serif;
          animation: ac-fact-in 0.3s ease forwards;
        }
        .ac-dots {
          display: flex; gap: 5px; justify-content: center; margin-bottom: 14px;
        }
        .ac-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: rgba(168,85,247,0.25); transition: all 0.2s;
          cursor: pointer;
        }
        .ac-dot.active { background: #a855f7; width: 18px; border-radius: 3px; }
        .ac-pdf-row {
          display: flex; align-items: center; gap: 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 12px 14px;
          margin-bottom: 14px;
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
        }
        .ac-pdf-row:hover {
          border-color: rgba(168,85,247,0.4);
          background: rgba(168,85,247,0.06);
        }
        .ac-pdf-icon {
          width: 36px; height: 36px; border-radius: 8px;
          background: linear-gradient(135deg, #dc2626, #ef4444);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; flex-shrink: 0;
        }
        .ac-pdf-info { flex: 1; }
        .ac-pdf-name {
          font-size: 12px; font-weight: 700; color: #e2e8f0;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .ac-pdf-desc {
          font-size: 11px; color: #64748b; margin-top: 1px;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .ac-pdf-arrow {
          color: #a855f7; font-size: 16px; flex-shrink: 0;
        }
        .ac-cta-btn {
          width: 100%; padding: 13px;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          border: none; border-radius: 12px;
          color: white; font-size: 14px; font-weight: 700;
          font-family: 'DM Sans', system-ui, sans-serif;
          cursor: pointer; transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(124,58,237,0.35);
        }
        .ac-cta-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(124,58,237,0.5);
        }
        .ac-footer {
          font-size: 11px; color: #475569; text-align: center;
          margin-top: 10px;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        @media (max-width: 480px) {
          .ac-title { font-size: 18px; }
          .ac-stat-val { font-size: 18px; }
          .ac-stats-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="ac-popup-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
        <div className={`ac-popup-box${closing ? " closing" : ""}`}>
          <div className="ac-glow-top" />

          {/* Header */}
          <div className="ac-header">
            <button className="ac-close" onClick={handleClose}>✕</button>
            <div className="ac-badge">
              <span className="ac-badge-dot" />
              RESEARCH INSIGHT
            </div>
            <h2 className="ac-title">
              Did you know AI chatbots<br />
              increase sales by <span>up to 67%</span>?
            </h2>
            <p className="ac-subtitle">
              Here's what the data says about AI agents on e-commerce stores
            </p>
          </div>

          {/* Stats */}
          <div className="ac-stats-grid">
            {STATS.map((s) => (
              <div className="ac-stat" key={s.value}>
                <div className="ac-stat-val" style={{ color: s.color }}>{s.value}</div>
                <div className="ac-stat-lbl">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Body */}
          <div className="ac-body">
            {/* Rotating fact */}
            <div className="ac-fact-box">
              <span className="ac-fact-icon">{FACTS[activeFact].icon}</span>
              <p className="ac-fact-text" key={activeFact}>{FACTS[activeFact].text}</p>
            </div>

            {/* Dots */}
            <div className="ac-dots">
              {FACTS.map((_, i) => (
                <div
                  key={i}
                  className={`ac-dot${i === activeFact ? " active" : ""}`}
                  onClick={() => setActiveFact(i)}
                />
              ))}
            </div>

            {/* PDF Download */}
            <a
              href={PDF_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ac-pdf-row"
            >
              <div className="ac-pdf-icon">📄</div>
              <div className="ac-pdf-info">
                <div className="ac-pdf-name">AI Chatbot Sales Research Report — 5 Pages</div>
                <div className="ac-pdf-desc">Full study: cart abandonment, conversion data &amp; case studies</div>
              </div>
              <span className="ac-pdf-arrow">↓</span>
            </a>

            {/* CTA */}
            <button className="ac-cta-btn" onClick={handleClose}>
              Add AI Chat to My Store →
            </button>
            <p className="ac-footer">
              No credit card required · Setup in 1–2 days · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
