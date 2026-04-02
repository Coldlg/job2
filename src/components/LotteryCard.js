import { useState, useEffect } from "react";

const CopyIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

function getTimeRemaining(targetDate) {
  const now = new Date();
  const target = new Date(targetDate);
  const diff = target - now;

  if (diff <= 0) {
    return { days: 0, isExpired: true };
  }

  const days = Math.round(diff / (1000 * 60 * 60 * 24));

  return { days, isExpired: false };
}

export function LotteryCard({ lottery }) {
  const [copied, setCopied] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(() => getTimeRemaining(lottery.drawDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(lottery.drawDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [lottery.drawDate]);

  const hasMultipleImages = lottery.images && lottery.images.length > 0;
  const currentImage = hasMultipleImages
    ? lottery.images[currentImageIndex]
    : lottery.image || "https://placehold.co/600x400/png";

  const progress = Math.min(100, Math.round((lottery.ticketsSold / lottery.maximumTickets) * 100));

  const handleCopyAccount = async (e) => {
    e.stopPropagation();
    if (lottery.accountNumber) {
      try {
        await navigator.clipboard.writeText(lottery.accountNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy", err);
      }
    }
  };

  const nextImage = (e) => {
    e.stopPropagation();
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev === lottery.images.length - 1 ? 0 : prev + 1));
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev === 0 ? lottery.images.length - 1 : prev - 1));
    }
  };

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      if (hasMultipleImages) {
        setCurrentImageIndex((prev) => (prev === lottery.images.length - 1 ? 0 : prev + 1));
      }
    } else if (isRightSwipe) {
      if (hasMultipleImages) {
        setCurrentImageIndex((prev) => (prev === 0 ? lottery.images.length - 1 : prev - 1));
      }
    }
  };

  return (
    <>
      <style jsx>{`
        .ticket-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
          transition:
            border-color 0.2s,
            box-shadow 0.2s,
            transform 0.2s;
          animation: fadeUp 0.4s ease both;
          position: relative;
        }

        .ticket-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(99, 120, 255, 0.3),
            transparent
          );
          opacity: 0;
          transition: opacity 0.2s;
        }

        .ticket-card:hover {
          border-color: var(--border-bright);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          transform: translateY(-2px);
        }

        .ticket-card:hover::before {
          opacity: 1;
        }

        .image-container {
          position: relative;
          height: 180px;
          overflow: hidden;
          background: var(--surface2);
        }

        .image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s;
        }

        .image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(11, 13, 20, 0.9), transparent);
        }

        .countdown-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: linear-gradient(135deg, var(--gold), var(--gold-dim));
          color: var(--bg);
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(244, 185, 66, 0.3);
        }

        .nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(17, 21, 32, 0.7);
          border: 1px solid var(--border);
          color: var(--text);
          padding: 8px;
          border-radius: 50%;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s, background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-btn:hover {
          background: rgba(17, 21, 32, 0.9);
        }

        .image-container:hover .nav-btn {
          opacity: 1;
        }

        .nav-btn.prev {
          left: 12px;
        }

        .nav-btn.next {
          right: 12px;
        }

        .image-counter {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(11, 13, 20, 0.8);
          backdrop-filter: blur(4px);
          color: var(--text-muted);
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 100px;
          border: 1px solid var(--border);
        }

        .card-content {
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .title {
          font-size: 17px;
          font-weight: 700;
          color: var(--text);
          text-align: center;
        }

        .price-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--gold), #d4a017);
          color: var(--bg);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 16px;
          font-weight: 700;
          margin: 0 auto;
          box-shadow: 0 4px 12px rgba(244, 185, 66, 0.25);
        }

        .account-section {
          background: linear-gradient(135deg, var(--surface2), var(--surface));
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 14px;
          position: relative;
          overflow: hidden;
        }

        .account-section::before {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, rgba(99, 120, 255, 0.1), transparent);
          border-radius: 0 0 0 100%;
        }

        .account-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          position: relative;
          z-index: 1;
        }

        .account-info {
          flex: 1;
          min-width: 0;
        }

        .account-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 4px;
        }

        .account-number {
          font-family: "JetBrains Mono", monospace;
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
          word-break: break-all;
        }

        .account-name {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .copy-btn {
          flex-shrink: 0;
          background: rgba(99, 120, 255, 0.1);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .copy-btn:hover {
          background: rgba(99, 120, 255, 0.2);
          border-color: var(--border-bright);
        }

        .copy-btn svg {
          width: 16px;
          height: 16px;
          color: var(--text-muted);
          transition: color 0.2s;
        }

        .copy-btn:hover svg {
          color: var(--accent);
        }

        .copy-overlay {
          position: absolute;
          inset: 0;
          background: rgba(52, 211, 153, 0.15);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }

        .copy-success {
          color: var(--green);
          font-size: 13px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .progress-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: var(--text-muted);
        }

        .progress-header span:first-child {
          color: var(--text-muted);
        }

        .progress-header .sold {
          color: var(--text);
          font-weight: 600;
        }

        .progress-header .percent {
          color: var(--accent);
          font-weight: 700;
        }

        .progress-bar {
          width: 100%;
          height: 10px;
          background: var(--surface2);
          border-radius: 100px;
          overflow: hidden;
          border: 1px solid var(--border);
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent), var(--accent2));
          border-radius: 100px;
          transition: width 0.5s ease;
          position: relative;
        }

        .progress-fill::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          animation: shimmer 2s infinite;
        }

        .action-btn {
          width: 100%;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text);
          padding: 12px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .action-btn:hover {
          border-color: var(--border-bright);
          background: var(--surface2);
        }

        .action-btn:active {
          transform: scale(0.98);
        }

        .description {
          font-size: 12px;
          color: var(--text-muted);
          text-align: center;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
          cursor: pointer;
          transition: -webkit-line-clamp 0.2s;
        }

        .description:hover {
          -webkit-line-clamp: 3;
        }
      `}</style>

      <div className="ticket-card">
        {/* Image Section */}
        <div
          className="image-container"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <img src={currentImage} alt={lottery.title} draggable="false" />
          <div className="image-overlay" />

          <div className="countdown-badge">
            {timeLeft.isExpired ? "🎉 ДУУССАН" : `⏱️ ${timeLeft.days} Өдөр`}
          </div>

          {hasMultipleImages && (
            <>
              <button className="nav-btn prev" onClick={prevImage}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button className="nav-btn next" onClick={nextImage}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
              <div className="image-counter">
                {currentImageIndex + 1} / {lottery.images.length}
              </div>
            </>
          )}
        </div>

        {/* Content Section */}
        <div className="card-content">
          <h3 className="title">{lottery.title}</h3>

          <div className="price-badge">
            {lottery.price.toLocaleString()} ₮
          </div>

          {lottery.accountNumber && (
            <div className="account-section">
              <div className="account-row">
                <div className="account-info">
                  <div className="account-label">
                    💳 {lottery.bankName || "Банк"}
                  </div>
                  <div className="account-number">{lottery.accountNumber}</div>
                  <div className="account-name">{lottery.accountName}</div>
                </div>
                <button className="copy-btn" onClick={handleCopyAccount}>
                  <CopyIcon />
                </button>
              </div>
              {copied && (
                <div className="copy-overlay">
                  <span className="copy-success">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Хууллаа
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="progress-section">
            <div className="progress-header">
              <span>
                ⏰ <span className="sold">{lottery.ticketsSold}</span> /{" "}
                {lottery.maximumTickets} зарагдсан
              </span>
              <span className="percent">{progress}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <button
            className="action-btn"
            onClick={() => (window.location.href = `/lottery/${lottery.id}`)}
          >
            <svg
              width="18"
              height="18"
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
            ДУГААР ХАРАХ
          </button>

          {lottery.description && (
            <div className="description">{lottery.description}</div>
          )}
        </div>
      </div>
    </>
  );
}
