import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import prisma from "@/lib/prisma";
import Link from "next/link";

export default function LotteryTicketSearch({ lottery }) {
  const [phone, setPhone] = useState("");
  const [tickets, setTickets] = useState(lottery.tickets || []);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (tickets.length > 0) {
      setPage(1);
    }
  }, [tickets]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      setTickets(lottery.tickets || []);
      setSearched(false);
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const res = await fetch(
        `/api/tickets/search?lotteryId=${lottery.id}&phone=${encodeURIComponent(phone)}`,
      );
      const data = await res.json();

      if (res.ok) {
        setTickets(data.tickets);
      } else {
        setError(data.error || "Хайлт амжилтгүй боллоо");
      }
    } catch (err) {
      setError("Сүлжээний алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setPhone("");
    setTickets(lottery.tickets || []);
    setPage(1);
    setSearched(false);
    setError("");
  };

  const formatDate = (isoString) => {
    if (!isoString) return "—";
    const d = new Date(isoString);
    return d.toLocaleDateString("mn-MN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatTime = (isoString) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    return d.toLocaleTimeString("mn-MN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const totalPages = Math.max(1, Math.ceil(tickets.length / 50));
  const paginatedTickets = tickets.slice((page - 1) * 50, page * 50);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const goPrevPage = () => setPage((prev) => Math.max(1, prev - 1));
  const goNextPage = () => setPage((prev) => Math.min(totalPages, prev + 1));

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap");

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        :root {
          --bg: #0b0d14;
          --surface: #111520;
          --surface2: #161b2e;
          --border: rgba(99, 120, 255, 0.15);
          --border-bright: rgba(99, 120, 255, 0.4);
          --text: #e8eaf6;
          --text-muted: #7b82a8;
          --text-dim: #4a5070;
          --accent: #6378ff;
          --accent2: #a78bfa;
          --gold: #f4b942;
          --gold-dim: rgba(244, 185, 66, 0.15);
          --green: #34d399;
          --red: #f87171;
          --radius: 14px;
        }

        body {
          font-family: "Sora", sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
        }

        .mono {
          font-family: "JetBrains Mono", monospace;
        }

        /* Page layout */
        .page-wrapper {
          min-height: 100vh;
          max-height: 100vh;
          background: var(--bg);
          overflow-y: auto;
        }

        .page-header {
          background: linear-gradient(135deg, #0f1529 0%, #161b30 100%);
          border-bottom: 1px solid var(--border);
          padding: 0 24px;
          position: relative;
          overflow: hidden;
        }
        .page-header::before {
          content: "";
          position: absolute;
          top: -60px;
          left: -60px;
          width: 300px;
          height: 300px;
          background: radial-gradient(
            circle,
            rgba(99, 120, 255, 0.08) 0%,
            transparent 70%
          );
          pointer-events: none;
        }

        /* Main content */
        .main {
          max-width: 680px;
          margin: 0 auto;
          padding: 24px 24px 80px;
          padding-bottom: 0;
        }

        /* Back link */
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.02em;
          margin-bottom: 36px;
          transition: color 0.2s;
        }
        .back-link:hover {
          color: var(--accent);
        }
        .back-link svg {
          transition: transform 0.2s;
        }
        .back-link:hover svg {
          transform: translateX(-3px);
        }

        /* Page title section */
        .title-section {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr;
          text-align: center;
        }
        .lottery-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--gold-dim);
          border: 1px solid rgba(244, 185, 66, 0.3);
          color: var(--gold);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 5px 14px;
          border-radius: 100px;
          margin-bottom: 16px;
        }
        .page-title {
          font-size: clamp(22px, 4vw, 30px);
          font-weight: 700;
          color: var(--text);
          line-height: 1.2;
          margin-bottom: 8px;
        }
        .page-sub {
          font-size: 14px;
          color: var(--text-muted);
        }

        /* Search form */
        .search-form {
          margin-bottom: 32px;
        }

        .search-input-row {
          display: flex;
          gap: 10px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 6px 6px 6px 16px;
          transition:
            border-color 0.2s,
            box-shadow 0.2s;
        }
        .search-input-row:focus-within {
          border-color: var(--border-bright);
          box-shadow: 0 0 0 3px rgba(99, 120, 255, 0.08);
        }

        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text);
          font-family: "Sora", sans-serif;
          font-size: 15px;
          min-width: 0;
        }
        .search-input::placeholder {
          color: var(--text-dim);
        }

        .clear-btn {
          background: transparent;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 18px;
          line-height: 1;
          transition: color 0.2s;
          display: flex;
          align-items: center;
        }
        .clear-btn:hover {
          color: var(--text-muted);
        }

        .search-btn {
          background: var(--accent);
          border: none;
          color: #fff;
          font-family: "Sora", sans-serif;
          font-size: 14px;
          font-weight: 600;
          padding: 10px 22px;
          border-radius: 10px;
          cursor: pointer;
          white-space: nowrap;
          transition:
            background 0.2s,
            transform 0.1s,
            opacity 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .search-btn:hover:not(:disabled) {
          background: #7b8fff;
        }
        .search-btn:active:not(:disabled) {
          transform: scale(0.97);
        }
        .search-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        /* Spinner */
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }

        /* Result count */
        .result-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .result-count {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .result-count span {
          color: var(--accent);
          font-variant-numeric: tabular-nums;
        }

        /* Ticket card */
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .ticket-list-wrapper {
          max-height: calc(100vh - 360px);
          overflow-y: auto;
          padding-right: 4px;
          margin-bottom: 12px;
        }

        .ticket-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .pagination-controls {
          position: sticky;
          bottom: 10px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          background: rgba(11, 13, 20, 0.85);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 8px 12px;
          z-index: 20;
          backdrop-filter: blur(6px);
          margin-bottom: 16px;
        }

        .page-btn {
          background: var(--accent);
          border: 1px solid rgba(99, 120, 255, 0.45);
          color: #fff;
          border-radius: 8px;
          padding: 7px 14px;
          font-size: 14px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s;
        }

        .page-btn:hover:not(:disabled) {
          background: #7b8fff;
        }

        .page-btn:disabled {
          opacity: 0.48;
          cursor: not-allowed;
        }

        .page-info {
          color: var(--text);
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        .ticket-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 18px 20px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 16px;
          animation: fadeUp 0.3s ease both;
          transition:
            border-color 0.2s,
            box-shadow 0.2s;
          position: relative;
          overflow: hidden;
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
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
        }
        .ticket-card:hover::before {
          opacity: 1;
        }
        .ticket-card.is-winner {
          border-color: rgba(244, 185, 66, 0.4);
          background: linear-gradient(135deg, #111520, #1a1608);
        }

        /* Ticket number bubble */
        .ticket-number-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .ticket-number {
          width: 52px;
          height: 52px;
          background: var(--surface2);
          border: 1px solid var(--border-bright);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: "JetBrains Mono", monospace;
          font-size: 15px;
          font-weight: 600;
          color: var(--accent);
          letter-spacing: -0.02em;
          flex-shrink: 0;
        }
        .ticket-card.is-winner .ticket-number {
          background: var(--gold-dim);
          border-color: rgba(244, 185, 66, 0.5);
          color: var(--gold);
        }
        .winner-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--gold);
        }

        /* Ticket middle info */
        .ticket-info {
          min-width: 0;
        }
        .ticket-phone {
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 6px;
          font-family: "JetBrains Mono", monospace;
          letter-spacing: 0.02em;
        }
        .ticket-meta-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .meta-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          color: var(--text-muted);
        }
        .meta-chip svg {
          opacity: 0.6;
          flex-shrink: 0;
        }

        /* Ticket right: amount */
        .ticket-right {
          text-align: right;
          flex-shrink: 0;
        }
        .ticket-amount {
          font-size: 18px;
          font-weight: 700;
          color: var(--green);
          font-family: "JetBrains Mono", monospace;
          letter-spacing: -0.02em;
          white-space: nowrap;
        }
        .ticket-amount-label {
          font-size: 11px;
          color: var(--text-dim);
          margin-top: 3px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        /* Divider in cards */
        .card-divider {
          width: 1px;
          height: 40px;
          background: var(--border);
          flex-shrink: 0;
        }

        /* Empty / error states */
        .state-box {
          background: var(--surface);
          border: 1px dashed var(--border);
          border-radius: var(--radius);
          padding: 52px 24px;
          text-align: center;
        }
        .state-icon {
          font-size: 38px;
          margin-bottom: 14px;
        }
        .state-title {
          font-size: 17px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 6px;
        }
        .state-sub {
          font-size: 13px;
          color: var(--text-muted);
        }

        .error-box {
          background: rgba(248, 113, 113, 0.08);
          border: 1px solid rgba(248, 113, 113, 0.25);
          border-radius: var(--radius);
          padding: 14px 18px;
          color: var(--red);
          font-size: 14px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* Responsive */
        @media (max-width: 480px) {
          .ticket-card {
            grid-template-columns: auto 1fr;
            grid-template-rows: auto auto;
          }
          .ticket-right {
            grid-column: 2;
            text-align: left;
          }
          .card-divider {
            display: none;
          }
        }
      `}</style>

      <div className="page-wrapper">
        <div className="page-header">
          <Header />
        </div>

        <main className="main">
          {/* Back */}

          {/* Title */}
          <div className="title-section">
            <Link href="/" className="back-link">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M10 3L5 8L10 13"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Буцах
            </Link>
            <h1 className="page-title">{lottery.title}</h1>
          </div>

          {/* Search */}
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-input-row">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                style={{
                  color: "var(--text-dim)",
                  flexShrink: 0,
                  alignSelf: "center",
                }}
              >
                <path
                  d="M6.5 17H2m4.5-5H2m4.5-5H2"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <rect
                  x="8"
                  y="3"
                  width="14"
                  height="18"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="M12 8h6M12 12h4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              <input
                className="search-input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Утасны дугаар оруулах…"
                autoComplete="tel"
              />
              {phone && (
                <button
                  type="button"
                  className="clear-btn"
                  onClick={handleClear}
                  aria-label="Clear"
                >
                  ×
                </button>
              )}
              <button
                type="submit"
                className="search-btn"
                disabled={loading || !phone.trim()}
              >
                {loading ? (
                  <span className="spinner" />
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="11"
                      cy="11"
                      r="7"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M16.5 16.5L21 21"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                Хайх
              </button>
            </div>
          </form>

          {/* Error */}
          {error && (
            <div className="error-box">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                style={{ flexShrink: 0 }}
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M12 8v5M12 16v.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              {error}
            </div>
          )}

          {/* No results */}
          {searched && !loading && tickets.length === 0 && !error && (
            <div className="state-box">
              <div className="state-icon">🔍</div>
              <div className="state-title">Тасалбар олдсонгүй</div>
              <div className="state-sub">
                Утасны дугаараа шалгаад дахин оролдоно уу
              </div>
            </div>
          )}

          {/* Results */}
          {tickets.length > 0 && (
            <div>
              <div className="result-meta">
                <p className="result-count">
                  <span>{tickets.length}</span> тасалбар олдлоо
                </p>
                <p className="result-count">
                  <span>{page}</span> / <span>{totalPages}</span>
                </p>
              </div>

              <div className="ticket-list-wrapper">
                <div className="ticket-list">
                  {paginatedTickets.map((ticket, i) => (
                    <div
                      key={ticket.id}
                      className={`ticket-card${ticket.is_winner ? " is-winner" : ""}`}
                      style={{ animationDelay: `${i * 45}ms` }}
                    >
                      {/* Number */}
                      <div className="ticket-number-wrap">
                        <div className="ticket-number mono">
                          #{ticket.ticket_number}
                        </div>
                        {ticket.is_winner && (
                          <span className="winner-label">🏆 Ялагч</span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="ticket-info">
                        <div className="ticket-phone">
                          {ticket.phone_number}
                        </div>
                        <div className="ticket-meta-row">
                          <span className="meta-chip">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <rect
                                x="3"
                                y="4"
                                width="18"
                                height="18"
                                rx="2"
                                stroke="currentColor"
                                strokeWidth="1.8"
                              />
                              <path
                                d="M3 9h18M8 2v4M16 2v4"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                              />
                            </svg>
                            <span suppressHydrationWarning>
                              {formatDate(ticket.created_at)}
                            </span>
                          </span>
                          <span className="meta-chip">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="9"
                                stroke="currentColor"
                                strokeWidth="1.8"
                              />
                              <path
                                d="M12 7v5l3 3"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                              />
                            </svg>
                            <span suppressHydrationWarning>
                              {formatTime(ticket.created_at)}
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="card-divider" />

                      {/* Amount */}
                      <div className="ticket-right">
                        <div className="ticket-amount mono">
                          {ticket.amount_paid.toLocaleString()}₮
                        </div>
                        <div className="ticket-amount-label">Төлсөн дүн</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pagination-controls">
                <button
                  className="page-btn"
                  onClick={goPrevPage}
                  disabled={page <= 1}
                >
                  Өмнөх
                </button>
                <div className="page-info">
                  {page} / {totalPages}
                </div>
                <button
                  className="page-btn"
                  onClick={goNextPage}
                  disabled={page >= totalPages}
                >
                  Дараах
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export async function getStaticPaths() {
  const lotteries = await prisma.lottery.findMany({
    select: { id: true },
  });

  return {
    paths: lotteries.map((l) => ({ params: { id: l.id.toString() } })),
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
  const lottery = await prisma.lottery.findUnique({
    where: { id: parseInt(params.id) },
    include: {
      tickets: {
        orderBy: { created_at: "desc" },
      },
    },
  });

  if (!lottery) return { notFound: true };

  return {
    props: {
      lottery: {
        ...lottery,
        drawDate: lottery.drawDate.toISOString(),
        tickets: lottery.tickets.map((t) => ({
          ...t,
          amount_paid: parseFloat(t.amount_paid.toString()),
          created_at: t.created_at.toISOString(), // ← from Ticket.created_at
          is_winner: t.is_winner, // ← from Ticket.is_winner
        })),
      },
    },
    revalidate: 60,
  };
}
