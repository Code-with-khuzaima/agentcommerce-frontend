import { useEffect, useState } from "react";

const PDF_URL = "/AI_Chatbot_Sales_Research.pdf";

const STATS = [
  { value: "67%", label: "Sales lift" },
  { value: "40%", label: "Cart recovery" },
  { value: "3x", label: "Conversion gain" },
  { value: "24/7", label: "Always on" },
];

const FACTS = [
  "AI chat can recover abandoned carts by answering objections before the visitor leaves.",
  "Guided recommendations improve conversion when shoppers are comparing similar products.",
  "Fast answers on shipping, returns, and sizing remove friction at the point of purchase.",
  "A well-configured assistant increases response coverage without forcing the store owner online.",
];

export default function SalesPopup({ enabled = true }) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [activeFact, setActiveFact] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setVisible(false);
      setClosing(false);
      return undefined;
    }

    const timer = setInterval(() => {
      setVisible((current) => (current ? current : true));
    }, 15000);

    return () => clearInterval(timer);
  }, [enabled]);

  useEffect(() => {
    if (!visible) return undefined;

    const rotation = setInterval(() => {
      setActiveFact((current) => (current + 1) % FACTS.length);
    }, 4000);

    return () => clearInterval(rotation);
  }, [visible]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
    }, 220);
  };

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes ac-popup-in {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes ac-popup-out {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(14px) scale(0.98); }
        }
        @keyframes ac-fact-fade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ac-popup-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(2, 6, 23, 0.76);
          backdrop-filter: blur(6px);
        }
        .ac-popup-box {
          width: 100%;
          max-width: 560px;
          max-height: min(84vh, 640px);
          border: 1px solid rgba(148, 163, 184, 0.18);
          border-radius: 22px;
          overflow: hidden;
          background:
            linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(7, 12, 26, 0.98));
          box-shadow: 0 26px 80px rgba(2, 6, 23, 0.58);
          animation: ac-popup-in 0.28s ease forwards;
          display: flex;
          flex-direction: column;
        }
        .ac-popup-box.closing {
          animation: ac-popup-out 0.22s ease forwards;
        }
        .ac-header {
          position: relative;
          padding: 20px 22px 16px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.12);
          background:
            radial-gradient(circle at top right, rgba(59, 130, 246, 0.16), transparent 34%),
            radial-gradient(circle at top left, rgba(16, 185, 129, 0.10), transparent 36%);
          flex-shrink: 0;
        }
        .ac-eyebrow {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(59, 130, 246, 0.12);
          border: 1px solid rgba(59, 130, 246, 0.22);
          color: #93c5fd;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .ac-title {
          margin: 16px 0 10px;
          color: #f8fafc;
          font-size: 24px;
          line-height: 1.12;
          font-weight: 800;
          max-width: 420px;
        }
        .ac-title-accent {
          color: #c4b5fd;
        }
        .ac-subtitle {
          margin: 0;
          max-width: 430px;
          color: #94a3b8;
          font-size: 13px;
          line-height: 1.55;
        }
        .ac-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 34px;
          height: 34px;
          border: 1px solid rgba(148, 163, 184, 0.18);
          border-radius: 10px;
          background: rgba(15, 23, 42, 0.78);
          color: #cbd5e1;
          font-size: 18px;
          cursor: pointer;
        }
        .ac-close:hover {
          background: rgba(30, 41, 59, 0.96);
        }
        .ac-body {
          padding: 14px 22px 18px;
        }
        .ac-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 12px;
        }
        .ac-stat {
          padding: 12px 12px 10px;
          border: 1px solid rgba(148, 163, 184, 0.12);
          border-radius: 16px;
          background: rgba(15, 23, 42, 0.62);
        }
        .ac-stat-value {
          color: #f8fafc;
          font-size: 20px;
          line-height: 1;
          font-weight: 800;
          margin-bottom: 6px;
        }
        .ac-stat-label {
          color: #94a3b8;
          font-size: 11px;
          line-height: 1.35;
        }
        .ac-fact-box {
          padding: 14px 14px 12px;
          border: 1px solid rgba(59, 130, 246, 0.16);
          border-radius: 18px;
          background:
            linear-gradient(180deg, rgba(30, 41, 59, 0.48), rgba(15, 23, 42, 0.68));
          margin-bottom: 12px;
        }
        .ac-fact-label {
          color: #93c5fd;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .ac-fact-text {
          margin: 0;
          color: #e2e8f0;
          font-size: 13px;
          line-height: 1.5;
          animation: ac-fact-fade 0.22s ease;
        }
        .ac-dots {
          display: flex;
          gap: 8px;
          margin-top: 10px;
        }
        .ac-dot {
          width: 10px;
          height: 10px;
          border: 0;
          border-radius: 999px;
          background: rgba(148, 163, 184, 0.28);
          cursor: pointer;
        }
        .ac-dot.active {
          width: 28px;
          background: #60a5fa;
        }
        .ac-actions {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          align-items: stretch;
        }
        .ac-pdf-row {
          display: block;
          border: 1px solid rgba(148, 163, 184, 0.14);
          border-radius: 18px;
          padding: 14px;
          background: rgba(15, 23, 42, 0.62);
          text-decoration: none;
        }
        .ac-pdf-kicker {
          color: #fca5a5;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .ac-pdf-name {
          color: #f8fafc;
          font-size: 14px;
          font-weight: 700;
          line-height: 1.45;
          margin-bottom: 6px;
        }
        .ac-pdf-desc {
          color: #94a3b8;
          font-size: 11px;
          line-height: 1.45;
          margin-bottom: 8px;
        }
        .ac-pdf-meta {
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.02em;
        }
        .ac-cta-panel {
          border: 1px solid rgba(148, 163, 184, 0.14);
          border-radius: 18px;
          padding: 14px;
          background: rgba(15, 23, 42, 0.62);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .ac-cta-title {
          color: #f8fafc;
          font-size: 14px;
          font-weight: 700;
          line-height: 1.5;
          margin: 0 0 6px;
        }
        .ac-cta-copy {
          color: #94a3b8;
          font-size: 11px;
          line-height: 1.45;
          margin: 0 0 10px;
        }
        .ac-cta-btn {
          width: 100%;
          padding: 12px 14px;
          border: 0;
          border-radius: 12px;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          color: #ffffff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }
        .ac-footer {
          margin-top: 10px;
          color: #64748b;
          font-size: 11px;
          line-height: 1.35;
          text-align: center;
        }
        @media (max-width: 720px) {
          .ac-popup-overlay {
            padding: 14px;
          }
          .ac-header {
            padding: 18px 16px 14px;
          }
          .ac-body {
            padding: 12px 16px 16px;
          }
          .ac-title {
            font-size: 20px;
            max-width: none;
          }
          .ac-subtitle {
            max-width: none;
          }
          .ac-stats-grid,
          .ac-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="ac-popup-overlay" onClick={(event) => event.target === event.currentTarget && handleClose()}>
        <div className={`ac-popup-box${closing ? " closing" : ""}`}>
          <div className="ac-header">
            <button className="ac-close" onClick={handleClose} aria-label="Close popup">
              x
            </button>
            <div className="ac-eyebrow">AI commerce research</div>
            <h2 className="ac-title">
              See the numbers behind <span className="ac-title-accent">AI-assisted sales growth</span>
            </h2>
            <p className="ac-subtitle">
              This short report explains where AI chat improves conversion, reduces drop-off, and gives
              online stores better coverage without adding manual support load.
            </p>
          </div>

          <div className="ac-body">
            <div className="ac-stats-grid">
              {STATS.map((stat) => (
                <div className="ac-stat" key={stat.value}>
                  <div className="ac-stat-value">{stat.value}</div>
                  <div className="ac-stat-label">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="ac-fact-box">
              <div className="ac-fact-label">Key finding</div>
              <p className="ac-fact-text" key={activeFact}>
                {FACTS[activeFact]}
              </p>
              <div className="ac-dots">
                {FACTS.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`ac-dot${index === activeFact ? " active" : ""}`}
                    onClick={() => setActiveFact(index)}
                    aria-label={`Show fact ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="ac-actions">
              <a href={PDF_URL} target="_blank" rel="noopener noreferrer" className="ac-pdf-row">
                <div className="ac-pdf-kicker">Research report</div>
                <div className="ac-pdf-name">AI Chatbot Sales Research Report</div>
                <div className="ac-pdf-desc">
                  Open the full PDF with conversion data, cart recovery insights, and practical implementation
                  notes for e-commerce stores.
                </div>
                <div className="ac-pdf-meta">Open PDF in a new tab</div>
              </a>

              <div className="ac-cta-panel">
                <div>
                  <h3 className="ac-cta-title">Want this working on your store?</h3>
                  <p className="ac-cta-copy">
                    Start the setup flow to get your store configured for AI-assisted sales.
                  </p>
                </div>
                <button className="ac-cta-btn" onClick={handleClose}>
                  Continue on site
                </button>
              </div>
            </div>

            <div className="ac-footer">One month free trial. Setup in 1-2 days.</div>
          </div>
        </div>
      </div>
    </>
  );
}
