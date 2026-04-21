import { useState, useEffect } from "react";

export function ScrollToFAQ() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      const faqSection = document.getElementById("faq-section");
      if (faqSection) {
        const rect = faqSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        // Show button when FAQ is below viewport but not yet visible
        setIsVisible(rect.top > windowHeight * 0.3);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    window.addEventListener("resize", toggleVisibility);
    toggleVisibility();

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
      window.removeEventListener("resize", toggleVisibility);
    };
  }, []);

  const scrollToFAQ = () => {
    const faqSection = document.getElementById("faq-section");
    if (faqSection) {
      faqSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <style jsx>{`
        .scroll-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          color: var(--bg);
          border: none;
          border-radius: 100px;
          padding: 12px 20px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(99, 120, 255, 0.4);
          transition: all 0.3s ease;
          opacity: 0;
          transform: translateY(20px);
          pointer-events: none;
        }

        .scroll-btn.visible {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .scroll-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(99, 120, 255, 0.5);
        }

        .scroll-btn:active {
          transform: translateY(0);
        }

        .scroll-icon {
          width: 18px;
          height: 18px;
          animation: bounce 1.5s infinite;
        }

        @keyframes bounce {
          0%,
          20%,
          50%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-4px);
          }
          60% {
            transform: translateY(-2px);
          }
        }

        @media (max-width: 768px) {
          .scroll-btn {
            bottom: 16px;
            right: 16px;
            padding: 10px 16px;
          }
        }
      `}</style>

      <button
        className={`scroll-btn ${isVisible ? "visible" : ""}`}
        onClick={scrollToFAQ}
      >
        Асуулт
        <svg
          className="scroll-icon"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </button>
    </>
  );
}
