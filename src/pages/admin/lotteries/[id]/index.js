import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function EditLottery() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    ticketsSold: "",
    maximumTickets: "",
    drawDate: "",
    images: "",
    accountNumber: "",
    accountName: "",
    bankName: "",
    isHidden: false,
  });

  useEffect(() => {
    if (id) {
      fetchLottery();
    }
  }, [id]);

  const fetchLottery = async () => {
    try {
      const res = await fetch(`/api/admin/lotteries/${id}`);
      const data = await res.json();

      if (res.ok && data.lottery) {
        const lottery = data.lottery;
        setForm({
          title: lottery.title || "",
          description: lottery.description || "",
          price: lottery.price?.toString() || "",
          ticketsSold: lottery.ticketsSold?.toString() || "0",
          maximumTickets: lottery.maximumTickets?.toString() || "",
          drawDate: lottery.drawDate ? lottery.drawDate.slice(0, 16) : "",
          images: (lottery.images || []).join("\n"),
          accountNumber: lottery.accountNumber || "",
          accountName: lottery.accountName || "",
          bankName: lottery.bankName || "",
          isHidden: lottery.isHidden || false,
        });
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

    try {
      const res = await fetch(`/api/admin/lotteries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          images: form.images.split("\n").filter((url) => url.trim()),
        }),
      });

      if (res.ok) {
        router.push("/admin");
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
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .input:focus {
          border-color: var(--border-bright);
          box-shadow: 0 0 0 3px rgba(99, 120, 255, 0.08);
        }

        .input::placeholder {
          color: var(--text-dim);
        }

        .textarea {
          composes: input;
          resize: vertical;
          min-height: 80px;
        }

        .textarea.monospace {
          font-family: "JetBrains Mono", monospace;
          font-size: 13px;
        }

        .grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
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

        @media (max-width: 640px) {
          .grid-3 {
            grid-template-columns: 1fr;
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
            <h1 className="page-title">✏️ Сугалаа засах #{id}</h1>
          </div>
        </header>

        <main className="main">
          <form onSubmit={handleSubmit} className="form">
            {error && <div className="error-box">{error}</div>}

            <div className="form-section">
              <h2 className="section-title">Үндсэн мэдээлэл</h2>

              <div className="form-group">
                <label className="label">Нэр *</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="label">Тайлбар</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="textarea"
                />
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="label">Үнэ (₮) *</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    required
                    className="input"
                  />
                </div>
                <div className="form-group">
                  <label className="label">Зарагдсан</label>
                  <input
                    type="number"
                    name="ticketsSold"
                    value={form.ticketsSold}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
                <div className="form-group">
                  <label className="label">Хамгийн их *</label>
                  <input
                    type="number"
                    name="maximumTickets"
                    value={form.maximumTickets}
                    onChange={handleChange}
                    required
                    className="input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Дуусах огноо *</label>
                <input
                  type="datetime-local"
                  name="drawDate"
                  value={form.drawDate}
                  onChange={handleChange}
                  required
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="label">Зургийн URL-ууд (мөр бүр нэг URL)</label>
                <textarea
                  name="images"
                  value={form.images}
                  onChange={handleChange}
                  rows={3}
                  className="textarea monospace"
                />
              </div>

              <div className="checkbox-row">
                <input
                  type="checkbox"
                  name="isHidden"
                  id="isHidden"
                  checked={form.isHidden}
                  onChange={handleChange}
                  className="checkbox"
                />
                <label htmlFor="isHidden" className="checkbox-label">
                  Нийтээс нуух (Hidden)
                </label>
              </div>
            </div>

            <div className="form-section">
              <h2 className="section-title">💳 Дансны мэдээлэл</h2>

              <div className="form-group">
                <label className="label">Банкны нэр</label>
                <input
                  type="text"
                  name="bankName"
                  value={form.bankName}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="label">Дансны дугаар</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={form.accountNumber}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="label">Дансны эзэмшигч</label>
                <input
                  type="text"
                  name="accountName"
                  value={form.accountName}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="submit-btn"
            >
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
