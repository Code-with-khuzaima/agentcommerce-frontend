import { useEffect, useState } from "react";

const PDF_URL = "/AI_Chatbot_Sales_Research.pdf";

const STATS = [
  { value: "67%", label: "Sales lift" },
  { value: "40%", label: "Cart recovery" },
  { value: "3x", label: "Conversion gain" },
  { value: "24/7", label: "Coverage" },
];

const FACTS = [
  "AI chat removes hesitation when shoppers need sizing, delivery, or return answers before checkout.",
  "Product recommendations inside chat improve conversion when the buyer is comparing similar items.",
  "Live assistance inside the store can recover revenue before the visitor abandons the cart.",
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
    }, 4500);

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
          from { opacity: 0; transform: translateY(18px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes ac-popup-out {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(10px) scale(0.98); }
        }
        @keyframes ac-fade-up {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ac-popup-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(2, 6, 23, 0.74);
          backdrop-filter: blur(7px);
        }
        .ac-popup-box {
          width: 100%;
          max-width: 540px;
          border-radius: 24px;
          border: 1px solid rgba(148, 163, 184, 0.16);
          background:
            radial-gradient(circle at top right, rgba(37, 99, 235, 0.14), transparent 30%),
            linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(8, 15, 30, 0.98));
          box-shadow: 0 28px 70px rgba(2, 6, 23, 0.56);
          animation: ac-popup-in 0.24s ease forwards;
          overflow: hidden;
        }
        .ac-popup-box.closing {
          animation: ac-popup-out 0.2s ease forwards;
        }
        .ac-header {
          position: relative;
          padding: 22px 22px 16px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }
        .ac-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 34px;
          height: 34px;
          border: 1px solid rgba(148, 163, 184, 0.16);
          border-radius: 10px;
          background: rgba(15, 23, 42, 0.78);
          color: #cbd5e1;
          font-size: 16px;
          cursor: pointer;
        }
        .ac-close:hover {
          background: rgba(30, 41, 59, 0.92);
        }
        .ac-kicker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(59, 130, 246, 0.12);
          color: #93c5fd;
          border: 1px solid rgba(59, 130, 246, 0.2);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .ac-kicker-dot {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #60a5fa;
        }
        .ac-title {
          margin: 14px 0 8px;
          color: #f8fafc;
          font-size: 27px;
          line-height: 1.08;
          font-weight: 800;
          max-width: 430px;
        }
        .ac-title-accent {
          color: #c4b5fd;
        }
        .ac-subtitle {
          margin: 0;
          color: #94a3b8;
          font-size: 13px;
          line-height: 1.55;
          max-width: 440px;
        }
        .ac-body {
          padding: 16px 22px 20px;
        }
        .ac-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
          margin-bottom: 12px;
        }
        .ac-stat {
          border: 1px solid rgba(148, 163, 184, 0.12);
          border-radius: 16px;
          background: rgba(15, 23, 42, 0.64);
          padding: 12px 10px 10px;
          text-align: center;
        }
        .ac-stat-value {
          color: #f8fafc;
          font-size: 18px;
          font-weight: 800;
          line-height: 1;
          margin-bottom: 6px;
        }
        .ac-stat-label {
          color: #94a3b8;
          font-size: 10px;
          line-height: 1.25;
          letter-spacing: 0.01em;
        }
        .ac-insight {
          border: 1px solid rgba(59, 130, 246, 0.16);
          border-radius: 18px;
          background: linear-gradient(180deg, rgba(30, 41, 59, 0.44), rgba(15, 23, 42, 0.64));
          padding: 14px 16px;
          margin-bottom: 12px;
        }
        .ac-insight-label {
          color: #93c5fd;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .ac-insight-text {
          margin: 0;
          color: #e2e8f0;
          font-size: 13px;
          line-height: 1.55;
          animation: ac-fade-up 0.2s ease;
        }
        .ac-dots {
          display: flex;
          gap: 7px;
          margin-top: 10px;
        }
        .ac-dot {
          width: 8px;
          height: 8px;
          border: 0;
          border-radius: 999px;
          background: rgba(148, 163, 184, 0.26);
          cursor: pointer;
          padding: 0;
        }
        .ac-dot.active {
          width: 24px;
          background: #60a5fa;
        }
        .ac-panel {
          border: 1px solid rgba(148, 163, 184, 0.12);
          border-radius: 18px;
          background: rgba(15, 23, 42, 0.64);
          padding: 16px;
        }
        .ac-panel-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }
        .ac-panel-kicker {
          color: #fca5a5;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .ac-panel-title {
          color: #f8fafc;
          font-size: 16px;
          font-weight: 700;
          line-height: 1.35;
          margin: 0 0 6px;
        }
        .ac-panel-copy {
          color: #94a3b8;
          font-size: 12px;
          line-height: 1.5;
          margin: 0;
        }
        .ac-pdf-badge {
          flex-shrink: 0;
          min-width: 56px;
          border-radius: 14px;
          padding: 10px 8px;
          text-align: center;
          background: linear-gradient(135deg, #b91c1c, #ef4444);
          color: #fff;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .ac-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .ac-link-btn,
        .ac-primary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 44px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
        }
        .ac-link-btn {
          border: 1px solid rgba(148, 163, 184, 0.16);
          background: rgba(255, 255, 255, 0.03);
          color: #e2e8f0;
        }
        .ac-primary-btn {
          border: 0;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          color: #ffffff;
        }
        .ac-footer {
          margin-top: 12px;
          color: #64748b;
          font-size: 11px;
          line-height: 1.35;
          text-align: center;
        }
        @media (max-width: 640px) {
          .ac-popup-overlay {
            padding: 12px;
          }
          .ac-header {
            padding: 18px 16px 14px;
          }
          .ac-body {
            padding: 12px 16px 16px;
          }
          .ac-title {
            font-size: 22px;
            max-width: none;
          }
          .ac-subtitle {
            max-width: none;
          }
          .ac-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .ac-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="ac-popup-overlay" onClick={(event) => event.target === event.currentTarget && handleClose()}>
        <div className={`ac-popup-box${closing ? " closing" : ""}`}>
          <div className="ac-header">
            <button className="ac-close" onClick={handleClose} aria-label="Close popup">
              ×
            </button>
            <div className="ac-kicker">
              <span className="ac-kicker-dot" />
              AI commerce research
            </div>
            <h2 className="ac-title">
              See how <span className="ac-title-accent">AI chat improves sales</span>
            </h2>
            <p className="ac-subtitle">
              Open the short research report or continue to the setup flow. This popup stays compact and should fit
              cleanly without scrolling.
            </p>
          </div>

          <div className="ac-body">
            <div className="ac-stats">
              {STATS.map((stat) => (
                <div className="ac-stat" key={stat.value}>
                  <div className="ac-stat-value">{stat.value}</div>
                  <div className="ac-stat-label">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="ac-insight">
              <div className="ac-insight-label">Key finding</div>
              <p className="ac-insight-text" key={activeFact}>
                {FACTS[activeFact]}
              </p>
              <div className="ac-dots">
                {FACTS.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`ac-dot${index === activeFact ? " active" : ""}`}
                    onClick={() => setActiveFact(index)}
                    aria-label={`Show finding ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="ac-panel">
              <div className="ac-panel-top">
                <div>
                  <div className="ac-panel-kicker">Research report</div>
                  <h3 className="ac-panel-title">AI Chatbot Sales Research Report</h3>
                  <p className="ac-panel-copy">
                    Conversion data, cart recovery impact, and practical notes for Shopify and WooCommerce stores.
                  </p>
                </div>
                <div className="ac-pdf-badge">PDF</div>
              </div>

              <div className="ac-actions">
                <a href={PDF_URL} target="_blank" rel="noopener noreferrer" className="ac-link-btn">
                  Open report
                </a>
                <button className="ac-primary-btn" onClick={handleClose}>
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
