import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function LotteryTickets() {
  const router = useRouter();
  const { id } = router.query;
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTickets, setTotalTickets] = useState(0);
  const [lotteryTitle, setLotteryTitle] = useState("");

  useEffect(() => {
    if (id) {
      fetchTickets();
    }
  }, [id, page]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tickets?lotteryId=${id}&page=${page}&limit=50`);
      const data = await res.json();

      if (res.ok) {
        setTickets(data.tickets || []);
        setTotalPages(data.totalPages || 1);
        setTotalTickets(data.total || 0);
      } else {
        console.error("Failed to fetch tickets");
      }
    } catch (err) {
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ticketId, ticketLotteryId) => {
    if (!confirm("Энэ тасалбарыг устгах уу?")) return;

    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setTickets(tickets.filter((t) => t.id !== ticketId));
        setTotalTickets((prev) => prev - 1);
      } else {
        alert("Тасалбар устгахад алдаа гарлаа");
      }
    } catch (err) {
      console.error("Error deleting ticket:", err);
    }
  };

  const handleToggleWinner = async (ticketId, currentIsWinner) => {
    try {
      const ticket = tickets.find((t) => t.id === ticketId);
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: ticket.phone_number,
          amount_paid: ticket.amount_paid,
          is_winner: !currentIsWinner,
        }),
      });

      if (res.ok) {
        setTickets(
          tickets.map((t) =>
            t.id === ticketId ? { ...t, is_winner: !currentIsWinner } : t
          )
        );
      }
    } catch (err) {
      console.error("Error toggling winner status:", err);
    }
  };

  const goToEdit = (ticketId) => {
    router.push(`/admin/tickets/${ticketId}/edit`);
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

  return (
    <>
      <style jsx global>{`
        .page-wrapper {
          min-height: 100vh;
          background: var(--bg);
        }

        .page-header {
          background: linear-gradient(135deg, #0f1529 0%, #161b30 100%);
          border-bottom: 1px solid var(--border);
          padding: 16px 24px;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .back-btn {
          color: var(--text-muted);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          padding: 8px 14px;
          border-radius: 8px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: 1px solid var(--border);
        }

        .back-btn:hover {
          color: var(--text);
          border-color: var(--border-bright);
          background: var(--surface);
        }

        .page-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
        }

        .main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 24px;
        }

        .lottery-info {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 20px 24px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .lottery-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
        }

        .lottery-stats {
          display: flex;
          gap: 24px;
        }

        .stat {
          text-align: right;
        }

        .stat-label {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .stat-value {
          font-size: 20px;
          font-weight: 700;
          color: var(--accent);
          font-family: "JetBrains Mono", monospace;
        }

        .content-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
        }

        .content-header {
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--surface2);
        }

        .content-title {
          font-size: 17px;
          font-weight: 700;
          color: var(--text);
        }

        .add-btn {
          background: var(--accent);
          color: #fff;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .add-btn:hover {
          background: #7b8fff;
        }

        .table-container {
          overflow-x: auto;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
        }

        .table thead {
          background: rgba(11, 13, 20, 0.5);
        }

        .table th {
          padding: 14px 20px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .table td {
          padding: 16px 20px;
          border-top: 1px solid var(--border);
        }

        .table tbody tr {
          transition: background 0.2s;
        }

        .table tbody tr:hover {
          background: var(--surface2);
        }

        .id-cell {
          color: var(--text-dim);
          font-family: "JetBrains Mono", monospace;
          font-size: 13px;
        }

        .ticket-num-cell {
          font-weight: 600;
          color: var(--accent);
          font-family: "JetBrains Mono", monospace;
        }

        .phone-cell {
          color: var(--text);
          font-family: "JetBrains Mono", monospace;
        }

        .amount-cell {
          color: var(--green);
          font-weight: 600;
          font-family: "JetBrains Mono", monospace;
        }

        .date-cell {
          color: var(--text-muted);
          font-size: 13px;
        }

        .winner-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(244, 185, 66, 0.15);
          border: 1px solid rgba(244, 185, 66, 0.3);
          color: var(--gold);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 100px;
        }

        .action-row {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          font-size: 12px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.2s;
          border: 1px solid;
          cursor: pointer;
        }

        .action-btn.edit {
          background: rgba(99, 120, 255, 0.1);
          border-color: rgba(99, 120, 255, 0.3);
          color: var(--accent);
        }

        .action-btn.edit:hover {
          background: rgba(99, 120, 255, 0.2);
        }

        .action-btn.winner {
          background: rgba(244, 185, 66, 0.1);
          border-color: rgba(244, 185, 66, 0.3);
          color: var(--gold);
        }

        .action-btn.winner:hover {
          background: rgba(244, 185, 66, 0.2);
        }

        .action-btn.delete {
          background: rgba(248, 113, 113, 0.1);
          border-color: rgba(248, 113, 113, 0.3);
          color: var(--red);
        }

        .action-btn.delete:hover {
          background: rgba(248, 113, 113, 0.2);
        }

        .pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-top: 1px solid var(--border);
          background: var(--surface2);
        }

        .pagination-info {
          font-size: 13px;
          color: var(--text-muted);
        }

        .pagination-info span {
          color: var(--accent);
          font-weight: 600;
        }

        .pagination-btns {
          display: flex;
          gap: 8px;
        }

        .page-btn {
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--text);
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .page-btn:hover:not(:disabled) {
          border-color: var(--border-bright);
          background: var(--surface2);
        }

        .page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .empty-state {
          padding: 48px 24px;
          text-align: center;
          color: var(--text-muted);
        }

        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <div className="page-wrapper">
        <header className="page-header">
          <div className="header-content">
            <Link href="/admin" className="back-btn">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              Буцах
            </Link>
            <h1 className="page-title">🎫 Тасалбарууд</h1>
          </div>
        </header>

        <main className="main">
          <div className="lottery-info">
            <div className="lottery-title">{lotteryTitle || `Сугалаа #${id}`}</div>
            <div className="lottery-stats">
              <div className="stat">
                <div className="stat-label">Нийт</div>
                <div className="stat-value">{totalTickets}</div>
              </div>
            </div>
          </div>

          <div className="content-card">
            <div className="content-header">
              <h2 className="content-title">Тасалбарын жагсаалт</h2>
              <Link href={`/admin/lotteries/${id}/addTickets`} className="add-btn">
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
                  <line x1="12" x2="12" y1="5" y2="19" />
                  <line x1="5" x2="19" y1="12" y2="12" />
                </svg>
                Тасалбар нэмэх
              </Link>
            </div>

            {loading ? (
              <div className="empty-state">Уншиж байна...</div>
            ) : tickets.length === 0 ? (
              <div className="empty-state">Тасалбар олдсонгүй</div>
            ) : (
              <>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Тасалбар #</th>
                        <th>Утасны дугаар</th>
                        <th>Дүн</th>
                        <th>Огноо</th>
                        <th>Төлөв</th>
                        <th style={{ textAlign: "center" }}>Үйлдэл</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((ticket) => (
                        <tr key={ticket.id}>
                          <td className="id-cell">#{ticket.id}</td>
                          <td className="ticket-num-cell">#{ticket.ticket_number}</td>
                          <td className="phone-cell">{ticket.phone_number}</td>
                          <td className="amount-cell">{ticket.amount_paid.toLocaleString()}₮</td>
                          <td className="date-cell">{formatDate(ticket.created_at)}</td>
                          <td>
                            {ticket.is_winner && (
                              <span className="winner-badge">
                                🏆 Ялагч
                              </span>
                            )}
                          </td>
                          <td>
                            <div className="action-row">
                              <button
                                onClick={() => goToEdit(ticket.id)}
                                className="action-btn edit"
                              >
                                Засах
                              </button>
                              <button
                                onClick={() =>
                                  handleToggleWinner(ticket.id, ticket.is_winner)
                                }
                                className="action-btn winner"
                              >
                                {ticket.is_winner ? "Ялагч биш" : "Ялагч"}
                              </button>
                              <button
                                onClick={() =>
                                  handleDelete(ticket.id, ticket.lottery_id)
                                }
                                className="action-btn delete"
                              >
                                Устгах
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pagination">
                  <div className="pagination-info">
                    <span>{page}</span> / <span>{totalPages}</span>
                  </div>
                  <div className="pagination-btns">
                    <button
                      className="page-btn"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      Өмнөх
                    </button>
                    <button
                      className="page-btn"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                    >
                      Дараах
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
