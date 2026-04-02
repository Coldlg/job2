import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import * as XLSX from "xlsx";

export default function LotteryTickets() {
  const router = useRouter();
  const { id } = router.query;
  const [lottery, setLottery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);

  useEffect(() => {
    if (id) {
      fetchLottery();
    }
  }, [id]);

  const fetchLottery = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/lotteries/${id}`);
      const data = await res.json();
      if (res.ok) setLottery(data.lottery);
    } catch (err) {
      console.error("Error fetching lottery:", err);
    } finally {
      setLoading(false);
    }
  };

  const extractPhoneNumber = (str) => {
    if (!str || typeof str !== "string") return null;

    const direct = str.match(/\+?976\d{8,9}/);
    if (direct) return direct[0];

    const loose = str.match(/\d{8}/);
    if (loose) return loose[0];

    return null;
  };

  const formatRowRaw = (row) => {
    if (!row || !Array.isArray(row)) return "";
    return row
      .slice(0, 3)
      .map((cell) => {
        if (cell === undefined || cell === null) return "";
        if (typeof cell === "object") {
          try {
            return JSON.stringify(cell);
          } catch {
            return String(cell);
          }
        }
        return String(cell);
      })
      .join(" | ");
  };

  const parsePreview = async (selectedFile) => {
    setPreviewLoading(true);
    setPreview(null);

    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const rows = jsonData.slice(0);
      const ticketPrice = lottery?.price || 0;

      let validCount = 0;
      let invalidCount = 0;
      let totalAmount = 0;
      const invalidRows = [];
      const invalidSampleRows = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < 3) {
          invalidCount++;
          const invalidRow = {
            rowNumber: i + 1,
            reason: "Багана дутуу",
            raw: formatRowRaw(row),
          };
          invalidRows.push(invalidRow);
          if (invalidSampleRows.length < 5) invalidSampleRows.push(invalidRow);
          continue;
        }

        const dateStr = row[0];
        const amountStr = row[1];
        const phoneStr = row[2];

        const phone_number = extractPhoneNumber(phoneStr);
        if (!phone_number) {
          invalidCount++;
          const invalidRow = {
            rowNumber: i + 1,
            reason: "Утасны дугаар буруу",
            raw: formatRowRaw(row),
          };
          invalidRows.push(invalidRow);
          if (invalidSampleRows.length < 5) invalidSampleRows.push(invalidRow);
          continue;
        }

        const amount_paid = parseFloat(amountStr);
        if (isNaN(amount_paid)) {
          invalidCount++;
          const invalidRow = {
            rowNumber: i + 1,
            reason: "Дүн буруу",
            raw: formatRowRaw(row),
          };
          invalidRows.push(invalidRow);
          if (invalidSampleRows.length < 5) invalidSampleRows.push(invalidRow);
          continue;
        }

        validCount++;
        totalAmount += amount_paid;
      }

      const expectedTickets =
        ticketPrice > 0 ? Math.floor(totalAmount / ticketPrice) : 0;

      setPreview({
        totalRows: rows.length,
        validRows: validCount,
        invalidRows: invalidCount,
        totalAmount,
        expectedTickets,
        invalidSampleRows,
        invalidRowDetails: invalidRows,
      });
    } catch (err) {
      console.error("Error parsing preview:", err);
      setPreview({ error: "Файл уншишгүй байна" });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile && lottery) {
      parsePreview(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file) {
      alert("Файл сонгоно уу");
      return;
    }

    setImporting(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const rows = jsonData.slice(0);
      const tickets = [];
      const failedRows = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < 3) {
          failedRows.push({
            rowNumber: i + 1,
            reason: "Багана дутуу",
            raw: formatRowRaw(row),
          });
          continue;
        }

        const dateStr = row[0];
        const amountStr = row[1];
        const phoneStr = row[2];

        const phone_number = extractPhoneNumber(phoneStr);
        if (!phone_number) {
          failedRows.push({
            rowNumber: i + 1,
            reason: "Утасны дугаар буруу",
            raw: formatRowRaw(row),
          });
          continue;
        }

        const amount_paid = parseFloat(amountStr);
        if (isNaN(amount_paid)) {
          failedRows.push({
            rowNumber: i + 1,
            reason: "Дүн буруу",
            raw: formatRowRaw(row),
          });
          continue;
        }

        const created_at = new Date(dateStr).toISOString();

        tickets.push({
          phone_number,
          amount_paid,
          created_at,
        });
      }

      if (tickets.length === 0) {
        alert("Файлын өгөгдөл буруу байна");
        setImporting(false);
        return;
      }

      const res = await fetch("/api/admin/tickets/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lotteryId: id,
          tickets,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setImportResult({
          success: true,
          imported: data.createdCount || 0,
          failed: failedRows.length,
          failedRows,
          message: data.message,
        });
        setFile(null);
        setPreview(null);
        document.getElementById("file-input").value = "";
      } else {
        const error = await res.json();
        alert(`Алдаа: ${error.error}`);
      }
    } catch (err) {
      console.error("Error importing:", err);
      alert("Импорт хийхэд алдаа гарлаа");
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div style={{ color: "var(--text)" }}>Уншиж байна...</div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        .page-wrapper {
          min-height: 100vh;
          max-height: 100vh;
          overflow: hidden;
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
          max-width: 900px;
          margin: 0 auto;
          padding: 32px 24px;
          max-height: calc(100vh - 88px);
          overflow-y: auto;
        }

        .import-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 24px;
          overflow-x: hidden;
        }

        .card-title {
          font-size: 17px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 12px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
          margin-bottom: 8px;
        }

        .file-input {
          width: 100%;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 12px 14px;
          color: var(--text);
          font-family: "Sora", sans-serif;
          font-size: 14px;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .file-input:hover {
          border-color: var(--border-bright);
        }

        .file-input::file-selector-button {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 8px 16px;
          color: var(--text);
          font-family: "Sora", sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          margin-right: 12px;
          transition: all 0.2s;
        }

        .file-input::file-selector-button:hover {
          border-color: var(--border-bright);
          background: var(--surface2);
        }

        .submit-btn {
          background: var(--accent);
          color: #fff;
          border: none;
          padding: 12px 24px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
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

        .info-box {
          background: rgba(99, 120, 255, 0.1);
          border: 1px solid rgba(99, 120, 255, 0.2);
          border-radius: 10px;
          padding: 16px;
          margin-bottom: 20px;
        }

        .info-box p {
          font-size: 13px;
          color: var(--text-muted);
          margin: 0;
        }

        .info-box .price {
          color: var(--gold);
          font-weight: 700;
          font-family: "JetBrains Mono", monospace;
        }

        /* Preview Section */
        .preview-section {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid var(--border);
        }

        .preview-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-muted);
          margin-bottom: 16px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .preview-title svg {
          width: 16px;
          height: 16px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }

        .stat-box {
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 14px;
        }

        .stat-label {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 6px;
        }

        .stat-value {
          font-size: 20px;
          font-weight: 700;
          font-family: "JetBrains Mono", monospace;
        }

        .stat-value.total {
          color: var(--text);
        }

        .stat-value.valid {
          color: var(--green);
        }

        .stat-value.invalid {
          color: var(--red);
        }

        .stat-value.tickets {
          color: var(--gold);
        }

        .stat-value.amount {
          color: var(--accent);
        }

        .preview-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 16px;
          overflox-x: scroll;
        }

        .preview-table th {
          text-align: left;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 10px 12px;
          border-bottom: 1px solid var(--border);
          overflow-x: scroll;
        }

        .preview-table td {
          padding: 12px;
          font-size: 13px;
          color: var(--text);
          border-bottom: 1px solid rgba(99, 120, 255, 0.08);
          overflow-x: scroll;
        }

        .preview-table tr:last-child td {
          border-bottom: none;
          overflow-x: scroll;
        }

        .preview-table .phone {
          font-family: "JetBrains Mono", monospace;
          font-weight: 600;
          overflow-x: scroll;
        }

        .preview-table .amount {
          color: var(--accent);
          font-family: "JetBrains Mono", monospace;
          font-weight: 600;
          overflow-x: scroll;
        }

        .preview-table .tickets {
          color: var(--gold);
          font-weight: 700;
          text-align: right;
          overflow-x: scroll;
        }

        .preview-table .date {
          color: var(--text-muted);
          font-size: 12px;
          overflow-x: scroll;
        }

        .loading-preview {
          padding: 24px;
          text-align: center;
          color: var(--text-muted);
          font-size: 14px;
        }

        .error-preview {
          padding: 16px;
          background: rgba(248, 113, 113, 0.1);
          border: 1px solid rgba(248, 113, 113, 0.3);
          border-radius: 10px;
          color: var(--red);
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sample-note {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 12px;
          font-style: italic;
        }

        /* Import Result Section */
        .result-section {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid var(--border);
        }

        .result-banner {
          padding: 16px 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 20px;
        }

        .result-banner.success {
          background: rgba(52, 211, 153, 0.1);
          border: 1px solid rgba(52, 211, 153, 0.3);
        }

        .result-banner.error {
          background: rgba(248, 113, 113, 0.1);
          border: 1px solid rgba(248, 113, 113, 0.3);
        }

        .result-icon {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
        }

        .result-icon.success {
          color: var(--green);
        }

        .result-icon.error {
          color: var(--red);
        }

        .result-content {
          flex: 1;
        }

        .result-title {
          font-size: 15px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .result-title.success {
          color: var(--green);
        }

        .result-title.error {
          color: var(--red);
        }

        .result-message {
          font-size: 13px;
          color: var(--text-muted);
        }

        .failed-rows-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-muted);
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .failed-rows-list {
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid var(--border);
          border-radius: 10px;
        }

        .failed-row-item {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(99, 120, 255, 0.08);
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .failed-row-item:last-child {
          border-bottom: none;
        }

        .failed-row-icon {
          width: 18px;
          height: 18px;
          color: var(--red);
          flex-shrink: 0;
          margin-top: 1px;
        }

        .failed-row-content {
          flex: 1;
          min-width: 0;
        }

        .failed-row-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .failed-row-number {
          font-family: "JetBrains Mono", monospace;
          font-size: 12px;
          color: var(--text-dim);
        }

        .failed-row-reason {
          font-size: 12px;
          font-weight: 600;
          color: var(--red);
          background: rgba(248, 113, 113, 0.1);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .failed-row-raw {
          font-family: "JetBrains Mono", monospace;
          font-size: 12px;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .close-btn {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-muted);
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          background: var(--surface2);
          color: var(--text);
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
            <h1 className="page-title">
              📊 {lottery?.title || "..."} - Тасалбар Импорт
            </h1>
          </div>
        </header>

        <main className="main">
          <div className="import-card">
            <h3 className="card-title">Excel файлаас тасалбар импорт хийх</h3>

            <div className="info-box">
              <p>
                Файлын формат: <strong>Огноо | Дүн | Утасны дугаар</strong>
              </p>
              <p style={{ marginTop: "4px" }}>
                Тасалбарын үнэ:{" "}
                <span className="price">
                  {lottery?.price?.toLocaleString()}₮
                </span>
              </p>
            </div>

            <div className="form-group">
              <label className="label">Excel файл сонгох</label>
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="file-input"
              />
            </div>

            {previewLoading && (
              <div className="loading-preview">
                <span className="spinner" style={{ marginRight: "8px" }}></span>
                Файл уншиж байна...
              </div>
            )}

            {preview && !previewLoading && (
              <div className="preview-section">
                {preview.error ? (
                  <div className="error-preview">
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
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" x2="12" y1="8" y2="12" />
                      <line x1="12" x2="12.01" y1="16" y2="16" />
                    </svg>
                    {preview.error}
                  </div>
                ) : (
                  <>
                    <div className="preview-title">
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
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      Файлын урьдчилсан харац
                    </div>

                    <div className="stats-grid">
                      <div className="stat-box">
                        <p className="stat-label">Нийт мөр</p>
                        <p className="stat-value total">{preview.totalRows}</p>
                      </div>
                      <div className="stat-box">
                        <p className="stat-label">Хүчинтэй</p>
                        <p className="stat-value valid">{preview.validRows}</p>
                      </div>
                      <div className="stat-box">
                        <p className="stat-label">Буруу</p>
                        <p className="stat-value invalid">
                          {preview.invalidRows}
                        </p>
                      </div>
                      <div className="stat-box">
                        <p className="stat-label">Нийт дүн</p>
                        <p className="stat-value amount">
                          {preview.totalAmount.toLocaleString()}₮
                        </p>
                      </div>
                      <div className="stat-box">
                        <p className="stat-label">Тасалбар тоо</p>
                        <p className="stat-value tickets">
                          ~{preview.expectedTickets.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {preview.invalidSampleRows &&
                      preview.invalidSampleRows.length > 0 && (
                        <>
                          <table className="preview-table">
                            <thead>
                              <tr>
                                <th>Мөр</th>
                                <th>Шалтгаан</th>
                                <th>Raw</th>
                              </tr>
                            </thead>
                            <tbody>
                              {preview.invalidSampleRows.map((row) => (
                                <tr key={row.rowNumber}>
                                  <td
                                    style={{
                                      color: "var(--text-dim)",
                                      fontFamily: "JetBrains Mono, monospace",
                                    }}
                                  >
                                    #{row.rowNumber}
                                  </td>
                                  <td className="failed-row-reason">
                                    {row.reason}
                                  </td>
                                  <td className="failed-row-raw">
                                    {typeof row.raw === "object"
                                      ? JSON.stringify(row.raw)
                                      : row.raw}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {preview.invalidRows > 5 && (
                            <p className="sample-note">
                              * Эхний 5 импорт хийгдээгүй мөрийг харуулж байна.
                              Нийт {preview.invalidRows} шалтгаантай мөр байна.
                            </p>
                          )}
                        </>
                      )}
                  </>
                )}
              </div>
            )}

            {importResult && (
              <div className="result-section">
                <div
                  className={`result-banner ${importResult.success ? "success" : "error"}`}
                >
                  {importResult.success ? (
                    <svg
                      className="result-icon success"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  ) : (
                    <svg
                      className="result-icon error"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" x2="12" y1="8" y2="12" />
                      <line x1="12" x2="12.01" y1="16" y2="16" />
                    </svg>
                  )}
                  <div className="result-content">
                    <p
                      className={`result-title ${importResult.success ? "success" : "error"}`}
                    >
                      {importResult.success
                        ? `✅ Амжилттай! ${importResult.imported} тасалбар импорт хийгдлээ`
                        : `❌ Алдаа: ${importResult.message}`}
                    </p>
                    {importResult.failed > 0 && (
                      <p className="result-message">
                        {importResult.failed} мөр импорт хийгдсэнгүй
                      </p>
                    )}
                  </div>
                  <button
                    className="close-btn"
                    onClick={() => setImportResult(null)}
                    aria-label="Close"
                  >
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
                      <line x1="18" x2="6" y1="6" y2="18" />
                      <line x1="6" x2="18" y1="6" y2="18" />
                    </svg>
                  </button>
                </div>

                {importResult.failedRows &&
                  importResult.failedRows.length > 0 && (
                    <div>
                      <h4 className="failed-rows-title">
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
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" x2="12" y1="8" y2="12" />
                          <line x1="12" x2="12.01" y1="16" y2="16" />
                        </svg>
                        Импорт хийгдээгүй мөрүүд (
                        {importResult.failedRows.length})
                      </h4>
                      <div className="failed-rows-list">
                        {importResult.failedRows.map((row, idx) => (
                          <div key={idx} className="failed-row-item">
                            <svg
                              className="failed-row-icon"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" x2="12" y1="8" y2="12" />
                              <line x1="12" x2="12.01" y1="16" y2="16" />
                            </svg>
                            <div className="failed-row-content">
                              <div className="failed-row-header">
                                <span className="failed-row-number">
                                  Мөр #{row.rowNumber}
                                </span>
                                <span className="failed-row-reason">
                                  {row.reason}
                                </span>
                              </div>
                              <div className="failed-row-raw">
                                {typeof row.raw === "object"
                                  ? JSON.stringify(row.raw)
                                  : row.raw}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}

            <button
              onClick={handleImport}
              disabled={importing || !file || !preview || preview.error}
              className="submit-btn"
              style={{ marginTop: "20px" }}
            >
              {importing ? (
                <>
                  <span className="spinner"></span>
                  Импорт хийж байна...
                </>
              ) : (
                <>
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
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" x2="12" y1="15" y2="3" />
                  </svg>
                  Импорт хийх
                </>
              )}
            </button>
          </div>
        </main>
      </div>
    </>
  );
}
