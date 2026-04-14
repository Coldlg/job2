import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function AdminDashboard() {
  const router = useRouter();
  const [lotteries, setLotteries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLotteries();
  }, []);

  const fetchLotteries = async () => {
    try {
      const res = await fetch("/api/admin/lotteries");
      const data = await res.json();
      setLotteries(data.lotteries || []);
    } catch (error) {
      console.error("Error fetching lotteries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (id, currentHidden) => {
    try {
      const lottery = lotteries.find((l) => l.id === id);
      const res = await fetch(`/api/admin/lotteries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: lottery.title,
          description: lottery.description,
          price: lottery.price,
          ticketsSold: lottery.ticketsSold,
          maximumTickets: lottery.maximumTickets,
          drawDate: lottery.drawDate,
          images: lottery.images,
          accountNumber: lottery.accountNumber,
          accountName: lottery.accountName,
          bankName: lottery.bankName,
          isHidden: !currentHidden,
        }),
      });
      if (res.ok) {
        setLotteries(
          lotteries.map((l) =>
            l.id === id ? { ...l, isHidden: !currentHidden } : l,
          ),
        );
      } else {
        alert("Төлөв өөрчлөхөд алдаа гарлаа");
      }
    } catch (error) {
      console.error("Error toggling visibility:", error);
      alert("Төлөв өөрчлөхөд алдаа гарлаа");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Энэ сугалааг устгах уу? Бүх тасалбарууд устах болно!"))
      return;

    try {
      const res = await fetch(`/api/admin/lotteries/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setLotteries(lotteries.filter((l) => l.id !== id));
      }
    } catch (error) {
      console.error("Error deleting lottery:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleExportTickets = async (lottery_id, lotteryTitle) => {
    try {
      const res = await fetch(
        `/api/admin/lotteries/${lottery_id}/export-tickets`,
      );
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${lotteryTitle.replace(/[^a-z0-9]/gi, "_")}_tickets.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting tickets:", error);
      alert("Тасалбар экспортлоход алдаа гарлаа");
    }
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
          justify-content: space-between;
        }

        .header-left {
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

        .logout-btn {
          background: rgba(248, 113, 113, 0.1);
          border: 1px solid rgba(248, 113, 113, 0.3);
          color: var(--red);
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .logout-btn:hover {
          background: rgba(248, 113, 113, 0.2);
          border-color: var(--red);
        }

        .main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 24px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 20px;
          transition: border-color 0.2s;
        }

        .stat-card:hover {
          border-color: var(--border-bright);
        }

        .stat-label {
          font-size: 12px;
          color: var(--text-muted);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--text);
        }

        .stat-value.green {
          color: var(--green);
        }

        .stat-value.accent {
          color: var(--accent);
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

        .table .id-cell {
          color: var(--text-dim);
          font-family: "JetBrains Mono", monospace;
          font-size: 13px;
        }

        .table .title-cell {
          font-weight: 600;
          color: var(--text);
        }

        .table .price-cell {
          color: var(--accent);
          font-weight: 600;
          font-family: "JetBrains Mono", monospace;
        }

        .table .tickets-cell {
          color: var(--text-muted);
        }

        .table .tickets-cell .total {
          color: var(--text);
        }

        .table .date-cell {
          color: var(--text);
          font-size: 13px;
        }

        .status-btn {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 100px;
          cursor: pointer;
          border: 1px solid;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .status-btn.status-hidden {
          background: rgba(248, 113, 113, 0.15);
          border-color: rgba(248, 113, 113, 0.4);
          color: #f87171;
          font-weight: 600;
        }

        .status-btn.status-hidden:hover {
          background: rgba(248, 113, 113, 0.25);
          border-color: #f87171;
        }

        .status-btn.status-visible {
          background: rgba(52, 211, 153, 0.15);
          border-color: rgba(52, 211, 153, 0.4);
          color: #34d399;
          font-weight: 600;
        }

        .status-btn.status-visible:hover {
          background: rgba(52, 211, 153, 0.25);
          border-color: #34d399;
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

        .action-btn.tickets {
          background: rgba(52, 211, 153, 0.1);
          border-color: rgba(52, 211, 153, 0.3);
          color: var(--green);
        }

        .action-btn.tickets:hover {
          background: rgba(52, 211, 153, 0.2);
        }

        .action-btn.delete {
          background: rgba(248, 113, 113, 0.1);
          border-color: rgba(248, 113, 113, 0.3);
          color: var(--red);
        }

        .action-btn.delete:hover {
          background: rgba(248, 113, 113, 0.2);
        }

        .empty-state {
          padding: 48px 24px;
          text-align: center;
          color: var(--text-muted);
        }

        @media (max-width: 768px) {
          .header-content {
            flex-wrap: wrap;
            gap: 12px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .table-container {
            font-size: 13px;
          }

          .action-row {
            flex-direction: column;
            gap: 6px;
          }
        }
      `}</style>

      <div className="page-wrapper">
        <header className="page-header">
          <div className="header-content">
            <div className="header-left">
              <Link href="/" className="back-btn">
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
                Нүүр
              </Link>
              <h1 className="page-title">🛠️ Админ Панел</h1>
            </div>
            <button onClick={handleLogout} className="logout-btn">
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
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
              Гарах
            </button>
          </div>
        </header>

        <main className="main">
          <div className="stats-grid">
            <div className="stat-card">
              <p className="stat-label">Нийт сугалаа</p>
              <p className="stat-value">{lotteries.length}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Идэвхтэй</p>
              <p className="stat-value green">
                {
                  lotteries.filter((l) => new Date(l.drawDate) > new Date())
                    .length
                }
              </p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Нийт тасалбар</p>
              <p className="stat-value accent">
                {lotteries
                  .reduce((acc, l) => acc + l.ticketsSold, 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>

          <div className="content-card">
            <div className="content-header">
              <h2 className="content-title">🎰 Сугалаанууд</h2>
              <Link href="/admin/lotteries/new" className="add-btn">
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
                Шинэ сугалаа
              </Link>
            </div>

            {loading ? (
              <div className="empty-state">Уншиж байна...</div>
            ) : lotteries.length === 0 ? (
              <div className="empty-state">Сугалаа олдсонгүй</div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Нэр</th>
                      <th>Үнэ</th>
                      <th>Тасалбар</th>
                      <th>Дуусах огноо</th>
                      <th style={{ textAlign: "center" }}>Төлөв</th>
                      <th>Үйлдэл</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lotteries.map((lottery) => (
                      <tr key={lottery.id}>
                        <td className="id-cell">#{lottery.id}</td>
                        <td className="title-cell">{lottery.title}</td>
                        <td className="price-cell">
                          {lottery.price.toLocaleString()}₮
                        </td>
                        <td className="tickets-cell">
                          <span>{lottery.ticketsSold}</span>
                          <span className="total">
                            /{lottery.maximumTickets}
                          </span>
                        </td>
                        <td className="date-cell">
                          {new Date(lottery.drawDate).toLocaleDateString(
                            "mn-MN",
                          )}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            onClick={() =>
                              handleToggleVisibility(
                                lottery.id,
                                lottery.isHidden,
                              )
                            }
                            className={`status-btn ${lottery.isHidden ? "status-hidden" : "status-visible"}`}
                          >
                            {lottery.isHidden ? "Нуусан" : "Ил"}
                          </button>
                        </td>
                        <td>
                          <div className="action-row">
                            <Link
                              href={`/admin/lotteries/${lottery.id}`}
                              className="action-btn edit"
                            >
                              Засах
                            </Link>
                            <Link
                              href={`/admin/lotteries/${lottery.id}/tickets`}
                              className="action-btn tickets"
                            >
                              Тасалбарууд
                            </Link>
                            <Link
                              href={`/admin/lotteries/${lottery.id}/addTickets`}
                              className="action-btn tickets"
                              style={{
                                background: "rgba(52, 211, 153, 0.05)",
                                border: "1px solid rgba(52, 211, 153, 0.2)",
                              }}
                            >
                              Нэмэх
                            </Link>
                            <button
                              onClick={() =>
                                handleExportTickets(lottery.id, lottery.title)
                              }
                              className="action-btn"
                              style={{
                                background: "rgba(147, 51, 234, 0.1)",
                                border: "1px solid rgba(147, 51, 234, 0.3)",
                                color: "#a855f7",
                              }}
                            >
                              Экспорт
                            </button>
                            <button
                              onClick={() => handleDelete(lottery.id)}
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
            )}
          </div>
        </main>
      </div>
    </>
  );
}
