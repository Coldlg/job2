export function HowItWorks() {
  const steps = [
    {
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
          <path d="M11 8v6" />
          <path d="M8 11h6" />
        </svg>
      ),
      title: "Сугалаа сонгох",
      description: "Өөрийн сугалааг сонгон утасны дугаараар бүртгүүлнэ",
    },
    {
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 100 100"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <text
            x="50"
            y="90"
            fontSize="110"
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
            fill="currentColor"
          >
            ₮
          </text>
        </svg>
      ),
      title: "Төлбөр төлөх",
      description: "Банкны дансаар шилжүүлж төлнө",
    },
    {
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2 15.09 8.26l6.91 1.09-5 4.87 1.18 6.88L12 17.77l-6.18 3.33L7 14.22 2 9.35l6.91-1.09L12 2z" />
        </svg>
      ),
      title: "Хонжвор авах",
      description: "Азтанг шууд дамжуулалтаар ил шудрагаар сугалана",
    },
  ];

  return (
    <>
      <style jsx>{`
        .hiw-section {
          background: linear-gradient(135deg, #0f1529 0%, #161b30 100%);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 80px 24px;
          position: relative;
          overflow: hidden;
        }

        .hiw-section::before {
          content: "";
          position: absolute;
          top: -100px;
          right: -100px;
          width: 400px;
          height: 400px;
          background: radial-gradient(
            circle,
            rgba(99, 120, 255, 0.06) 0%,
            transparent 50%
          );
          pointer-events: none;
        }

        .hiw-section::after {
          content: "";
          position: absolute;
          bottom: -100px;
          left: -100px;
          width: 400px;
          height: 400px;
          background: radial-gradient(
            circle,
            rgba(244, 185, 66, 0.04) 0%,
            transparent 50%
          );
          pointer-events: none;
        }

        .hiw-container {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .hiw-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .hiw-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(99, 120, 255, 0.15);
          border: 1px solid rgba(99, 120, 255, 0.3);
          color: var(--accent);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 5px 14px;
          border-radius: 100px;
          margin-bottom: 16px;
        }

        .hiw-title {
          font-size: clamp(24px, 4vw, 32px);
          font-weight: 700;
          color: var(--text);
          line-height: 1.2;
          margin-bottom: 12px;
        }

        .hiw-sub {
          font-size: 14px;
          color: var(--text-muted);
        }

        .hiw-steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 32px;
          position: relative;
        }

        @media (min-width: 768px) {
          .hiw-steps {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .hiw-step {
          background: rgba(20, 25, 45, 0.5);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 32px 24px;
          text-align: center;
          position: relative;
          z-index: 10;
          transition:
            transform 0.3s ease,
            border-color 0.3s ease;
        }

        .hiw-step:hover {
          transform: translateY(-4px);
          border-color: rgba(99, 120, 255, 0.3);
        }

        .hiw-step-number {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          color: var(--bg);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(99, 120, 255, 0.3);
        }

        .hiw-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 20px;
          background: linear-gradient(
            135deg,
            rgba(99, 120, 255, 0.15),
            rgba(59, 130, 246, 0.1)
          );
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          border: 2px solid rgba(99, 120, 255, 0.2);
          transition: all 0.3s ease;
        }

        .hiw-step:hover .hiw-icon {
          background: linear-gradient(
            135deg,
            rgba(99, 120, 255, 0.25),
            rgba(59, 130, 246, 0.15)
          );
          border-color: rgba(99, 120, 255, 0.4);
          transform: scale(1.05);
        }

        .hiw-step-title {
          font-size: 17px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 8px;
        }

        .hiw-step-desc {
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.6;
        }

        .hiw-arrow {
          display: none;
          position: absolute;
          top: 50%;
          right: -28px;
          transform: translateY(-50%);
          color: var(--text-muted);
          opacity: 0.5;
        }

        @media (min-width: 768px) {
          .hiw-step:not(:last-child) .hiw-arrow {
            display: block;
          }
        }
      `}</style>

      <section className="hiw-section">
        <div className="hiw-container">
          <div className="hiw-header">
            <div className="hiw-badge">
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="currentColor"
              >
                <circle cx="5" cy="5" r="5" />
              </svg>
              Энгийн 3 алхам
            </div>
            <h2 className="hiw-title">Хэрхэн оролцох вэ?</h2>
          </div>

          <div className="hiw-steps">
            {steps.map((step, index) => (
              <div key={index} className="hiw-step">
                <div className="hiw-step-number">{index + 1}</div>
                <div className="hiw-icon">{step.icon}</div>
                <h3 className="hiw-step-title">{step.title}</h3>
                <p className="hiw-step-desc">{step.description}</p>
                <div className="hiw-arrow">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
