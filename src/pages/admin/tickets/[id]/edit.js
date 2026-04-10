import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function EditTicket() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    ticket_number: "",
    phone_number: "",
    amount_paid: "",
    is_winner: false,
    lottery: null,
  });

  useEffect(() => {
    if (id) {
      fetchTicket();
    }
  }, [id]);

  const fetchTicket = async () => {
    try {
      const res = await fetch(`/api/admin/tickets/${id}`);
      const data = await res.json();

      if (res.ok && data.ticket) {
        const ticket = data.ticket;
        setForm({
          ticket_number: ticket.ticket_number?.toString() || "",
          phone_number: ticket.phone_number || "",
          amount_paid: ticket.amount_paid?.toString() || "",
          is_winner: ticket.is_winner || false,
          lottery: ticket.lottery || null,
        });
      } else {
        setError("Тасалбар олдсонгүй");
      }
    } catch (err) {
      setError("Мэдээлэл ачааллахад алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch(`/api/admin/tickets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: form.phone_number,
          amount_paid: parseFloat(form.amount_paid) || 0,
          is_winner: form.is_winner,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.back();
        }, 1000);
      } else {
        const data = await res.json();
        setError(data.error || "Алдаа гарлаа");
      }
    } catch (err) {
      setError("Сүлжээний алдаа");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <p style={{ color: "var(--text-muted)" }}>Уншиж байна...</p>
      </div>
    );
  }

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
          max-width: 900px;
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
          max-width: 700px;
          margin: 0 auto;
          padding: 32px 24px;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-section {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 24px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border);
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        .label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
          margin-bottom: 8px;
        }

        .input {
          width: 100%;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 12px 14px;
          color: var(--text);
          font-family: "Sora", sans-serif;
          font-size: 15px;
          outline: none;
          transition:
            border-color 0.2s,
            box-shadow 0.2s;
        }

        .input:focus {
          border-color: var(--border-bright);
          box-shadow: 0 0 0 3px rgba(99, 120, 255, 0.08);
        }

        .input::placeholder {
          color: var(--text-dim);
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-label {
          font-size: 14px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .info-value {
          font-size: 14px;
          color: var(--text);
          font-weight: 600;
        }

        .info-value.accent {
          color: var(--accent);
        }

        .checkbox-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-top: 8px;
        }

        .checkbox {
          width: 20px;
          height: 20px;
          accent-color: var(--accent);
          cursor: pointer;
        }

        .checkbox-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          cursor: pointer;
        }

        .error-box {
          background: rgba(248, 113, 113, 0.1);
          border: 1px solid rgba(248, 113, 113, 0.3);
          border-radius: var(--radius);
          padding: 14px 18px;
          color: var(--red);
          font-size: 14px;
        }

        .success-box {
          background: rgba(52, 211, 153, 0.1);
          border: 1px solid rgba(52, 211, 153, 0.3);
          border-radius: var(--radius);
          padding: 14px 18px;
          color: var(--green);
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .submit-btn {
          background: var(--accent);
          color: #fff;
          border: none;
          padding: 14px 24px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .submit-btn:hover:not(:disabled) {
          background: #7b8fff;
        }

        .submit-btn:active:not(:disabled) {
          transform: scale(0.98);
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

      <div className="page-wrapper">
        <header className="page-header">
          <div className="header-content">
            <button onClick={() => router.back()} className="back-btn">
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
            </button>
            <h1 className="page-title">
              ✏️ Тасалбар засах #{form.ticket_number}
            </h1>
          </div>
        </header>

        <main className="main">
          <form onSubmit={handleSubmit} className="form">
            {error && <div className="error-box">{error}</div>}
            {success && (
              <div className="success-box">
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Амжилттай хадгалагдлаа!
              </div>
            )}

            <div className="form-section">
              <h2 className="section-title">Тасалбарын мэдээлэл</h2>

              {form.lottery && (
                <>
                  <div className="info-row">
                    <span className="info-label">Сугалаа</span>
                    <span className="info-value accent">
                      {form.lottery.title}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Тасалбарын дугаар</span>
                    <span className="info-value">
                      #{form.ticket_number || "N/A"}
                    </span>
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="label">Утасны дугаар *</label>
                <input
                  type="text"
                  name="phone_number"
                  value={form.phone_number}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="+976XXXXXXXX"
                />
              </div>

              <div className="form-group">
                <label className="label">Төлсөн дүн (₮) *</label>
                <input
                  type="number"
                  name="amount_paid"
                  value={form.amount_paid}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="0"
                />
              </div>

              <div className="checkbox-row">
                <input
                  type="checkbox"
                  name="is_winner"
                  id="is_winner"
                  checked={form.is_winner}
                  onChange={handleChange}
                  className="checkbox"
                />
                <label htmlFor="is_winner" className="checkbox-label">
                  🏆 Хожсон тасалбар
                </label>
              </div>
            </div>

            <button type="submit" disabled={saving} className="submit-btn">
              {saving ? (
                <>
                  <span className="spinner"></span>
                  Хадгалж байна...
                </>
              ) : (
                <>
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
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  Хадгалах
                </>
              )}
            </button>
          </form>
        </main>
      </div>
    </>
  );
}
