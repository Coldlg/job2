import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import * as XLSX from "xlsx";

export default function AddTickets() {
  const router = useRouter();
  const { id } = router.query;
  const [lottery, setLottery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [file, setFile] = useState(null);
  const [allRows, setAllRows] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [showOnlyInvalid, setShowOnlyInvalid] = useState(false);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editValues, setEditValues] = useState({
    date: "",
    amount: "",
    phone: "",
  });

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
    if (str === undefined || str === null) return null;
    const value =
      typeof str === "number"
        ? String(str)
        : typeof str === "string"
          ? str
          : null;
    if (!value) return null;

    const direct = value.match(/\+?976\d{8,9}/);
    if (direct) return direct[0];
    const loose = value.match(/\d{8}/);
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

  // Validation function - returns { isValid, error }
  const validateRow = (dateStr, amountStr, phoneStr, ticketPrice) => {
    const phone_number = extractPhoneNumber(phoneStr);
    if (!phone_number) {
      return {
        isValid: false,
        error: "Утасны дугаар буруу",
        phone_number: null,
      };
    }

    const amount_paid = parseFloat(amountStr);
    if (isNaN(amount_paid)) {
      return { isValid: false, error: "Дүн буруу", phone_number };
    }

    if (amount_paid < ticketPrice) {
      return {
        isValid: false,
        error: `Төлбөр дутуу (хамгийн багадаа ${ticketPrice.toLocaleString()}₮ байх ёстой)`,
        phone_number,
        amount_paid,
      };
    }

    const created_at = new Date(dateStr).toISOString();
    return {
      isValid: true,
      error: null,
      phone_number,
      amount_paid,
      created_at,
    };
  };

  const parsePreview = async (selectedFile) => {
    setPreviewLoading(true);
    setAllRows([]);

    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const rows = jsonData;
      const ticketPrice = lottery?.price || 0;

      const parsedRows = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowId = `row-${i}`;

        // Handle insufficient columns
        if (row.length < 3) {
          parsedRows.push({
            id: rowId,
            rowNumber: i + 1,
            raw: row,
            rawDisplay: formatRowRaw(row),
            parsed: {
              date: row[0] || "",
              amount: row[1] || "",
              phone: row[2] || "",
            },
            isValid: false,
            isEdited: false,
            isForced: false,
            isIgnored: false,
            error: "Багана дутуу",
          });
          continue;
        }

        const dateStr = row[0] || "";
        const amountStr = row[1] || "";
        const phoneStr = row[2] || "";

        const validation = validateRow(
          dateStr,
          amountStr,
          phoneStr,
          ticketPrice,
        );

        parsedRows.push({
          id: rowId,
          rowNumber: i + 1,
          raw: row,
          rawDisplay: formatRowRaw(row),
          parsed: {
            date: dateStr,
            amount: amountStr,
            phone: phoneStr,
            ...(validation.amount_paid !== undefined && {
              amount_paid: validation.amount_paid,
            }),
            ...(validation.phone_number && {
              phone_number: validation.phone_number,
            }),
            ...(validation.created_at && {
              created_at: validation.created_at,
            }),
          },
          isValid: validation.isValid,
          isEdited: false,
          isForced: false,
          isIgnored: false,
          error: validation.error,
        });
      }

      setAllRows(parsedRows);
    } catch (err) {
      console.error("Error parsing preview:", err);
      setAllRows([]);
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

  // Row action handlers
  const handleEditRow = (row) => {
    setEditingRowId(row.id);
    setEditValues({
      date: row.parsed.date || "",
      amount: row.parsed.amount || "",
      phone: row.parsed.phone || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditValues({ date: "", amount: "", phone: "" });
  };

  const handleSaveEdit = (row) => {
    const ticketPrice = lottery?.price || 0;
    const validation = validateRow(
      editValues.date,
      editValues.amount,
      editValues.phone,
      ticketPrice,
    );

    setAllRows((prev) =>
      prev.map((r) => {
        if (r.id !== row.id) return r;
        return {
          ...r,
          parsed: {
            date: editValues.date,
            amount: editValues.amount,
            phone: editValues.phone,
            ...(validation.amount_paid !== undefined && {
              amount_paid: validation.amount_paid,
            }),
            ...(validation.phone_number && {
              phone_number: validation.phone_number,
            }),
            ...(validation.created_at && {
              created_at: validation.created_at,
            }),
          },
          isValid: validation.isValid,
          error: validation.error,
          isEdited: true,
        };
      }),
    );
    setEditingRowId(null);
    setEditValues({ date: "", amount: "", phone: "" });
  };

  const handleForceRow = (rowId) => {
    setAllRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;

        // When forcing, try to extract whatever data we can from the raw input
        const dateStr = r.parsed.date || "";
        const amountStr = r.parsed.amount || "";
        const phoneStr = r.parsed.phone || "";

        // Extract phone number - if invalid, use the raw string as fallback for forced import
        const extractedPhone = extractPhoneNumber(phoneStr);
        const phoneForImport = extractedPhone || phoneStr;

        // Parse amount - if invalid, default to 0 or lottery price
        const parsedAmount = parseFloat(amountStr);
        const amountForImport = isNaN(parsedAmount) ? 0 : parsedAmount;

        // Parse date - if invalid, use current date
        let createdAt;
        try {
          createdAt = new Date(dateStr).toISOString();
        } catch {
          createdAt = new Date().toISOString();
        }

        return {
          ...r,
          isForced: true,
          isIgnored: false,
          parsed: {
            ...r.parsed,
            phone_number: phoneForImport,
            amount_paid: amountForImport,
            created_at: createdAt,
          },
        };
      }),
    );
  };

  const handleIgnoreRow = (rowId) => {
    setAllRows((prev) =>
      prev.map((r) =>
        r.id === rowId ? { ...r, isIgnored: true, isForced: false } : r,
      ),
    );
  };

  const handleUnignoreRow = (rowId) => {
    setAllRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, isIgnored: false } : r)),
    );
  };

  // Computed stats
  const stats = useMemo(() => {
    const validRows = allRows.filter((r) => r.isValid && !r.isIgnored);
    const forcedRows = allRows.filter((r) => r.isForced && !r.isIgnored);
    const ignoredRows = allRows.filter((r) => r.isIgnored);
    const invalidRows = allRows.filter(
      (r) => !r.isValid && !r.isForced && !r.isIgnored,
    );

    const totalAmount = validRows.reduce(
      (sum, r) => sum + (r.parsed.amount_paid || 0),
      0,
    );
    const forcedAmount = forcedRows.reduce(
      (sum, r) => sum + (r.parsed.amount_paid || 0),
      0,
    );

    const ticketPrice = lottery?.price || 1;
    const expectedTickets = Math.floor(
      (totalAmount + forcedAmount) / ticketPrice,
    );

    return {
      total: allRows.length,
      valid: validRows.length,
      forced: forcedRows.length,
      ignored: ignoredRows.length,
      invalid: invalidRows.length,
      totalAmount: totalAmount + forcedAmount,
      expectedTickets,
    };
  }, [allRows, lottery?.price]);

  // Filtered rows for display
  const displayRows = useMemo(() => {
    if (showOnlyInvalid) {
      return allRows.filter((r) => !r.isValid && !r.isIgnored);
    }
    return allRows;
  }, [allRows, showOnlyInvalid]);

  const handleImport = async () => {
    if (!file || allRows.length === 0) {
      alert("Файл сонгоно уу");
      return;
    }

    setImporting(true);

    try {
      const tickets = [];
      const failedRows = [];

      for (const row of allRows) {
        // Skip ignored rows
        if (row.isIgnored) {
          failedRows.push({
            rowNumber: row.rowNumber,
            reason: "Импортөөс хассан",
            raw: row.rawDisplay,
          });
          continue;
        }

        // Include valid rows and forced rows
        if (row.isValid || row.isForced) {
          // For forced rows, use the parsed data directly (even if invalid)
          if (row.isForced) {
            tickets.push({
              phone_number: row.parsed.phone_number || row.parsed.phone || "",
              amount_paid:
                row.parsed.amount_paid || parseFloat(row.parsed.amount) || 0,
              created_at: row.parsed.created_at || new Date().toISOString(),
            });
          } else {
            // For valid rows, use validated data
            const { date, amount, phone } = row.parsed;
            const ticketPrice = lottery?.price || 0;
            const validation = validateRow(date, amount, phone, ticketPrice);

            if (validation.isValid) {
              tickets.push({
                phone_number: validation.phone_number,
                amount_paid: validation.amount_paid,
                created_at: validation.created_at,
              });
            } else {
              failedRows.push({
                rowNumber: row.rowNumber,
                reason: validation.error,
                raw: row.rawDisplay,
              });
            }
          }
        } else {
          failedRows.push({
            rowNumber: row.rowNumber,
            reason: row.error,
            raw: row.rawDisplay,
          });
        }
      }

      if (tickets.length === 0) {
        alert("Импортод оруулах тасалбар байхгүй байна");
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
          imported: data.createdCount || tickets.length,
          failed: failedRows.length,
          failedRows,
          message: data.message || "Амжилттай импорт хийгдлээ",
        });
        setFile(null);
        setAllRows([]);
        setShowOnlyInvalid(false);
        setEditingRowId(null);
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

  const handleClearAll = () => {
    setFile(null);
    setAllRows([]);
    setImportResult(null);
    setShowOnlyInvalid(false);
    setEditingRowId(null);
    document.getElementById("file-input").value = "";
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
          overflow-x: scroll;
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
        }

        .preview-table td {
          padding: 12px;
          font-size: 13px;
          color: var(--text);
          border-bottom: 1px solid rgba(99, 120, 255, 0.08);
        }

        .preview-table tr:last-child td {
          border-bottom: none;
        }

        .preview-table .phone {
          font-family: "JetBrains Mono", monospace;
          font-weight: 600;
        }

        .preview-table .amount {
          color: var(--accent);
          font-family: "JetBrains Mono", monospace;
          font-weight: 600;
        }

        .preview-table .tickets {
          color: var(--gold);
          font-weight: 700;
          text-align: right;
        }

        .preview-table .date {
          color: var(--text-muted);
          font-size: 12px;
        }

        /* Row states */
        .row-invalid {
          background: rgba(248, 113, 113, 0.08);
        }

        .row-invalid:hover {
          background: rgba(248, 113, 113, 0.12);
        }

        .row-edited {
          background: rgba(251, 191, 36, 0.08);
        }

        .row-edited:hover {
          background: rgba(251, 191, 36, 0.12);
        }

        .row-forced {
          background: rgba(52, 211, 153, 0.08);
        }

        .row-ignored {
          opacity: 0.5;
          background: rgba(99, 120, 255, 0.05);
        }

        .row-ignored td {
          text-decoration: line-through;
        }

        /* Row actions */
        .row-actions {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .action-btn {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          border: 1px solid transparent;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .action-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .action-btn-edit {
          background: var(--surface2);
          border-color: var(--border);
          color: var(--text);
        }

        .action-btn-edit:hover:not(:disabled) {
          background: var(--surface);
          border-color: var(--border-bright);
        }

        .action-btn-save {
          background: var(--green);
          color: #000;
        }

        .action-btn-save:hover:not(:disabled) {
          background: #34d399;
        }

        .action-btn-force {
          background: rgba(52, 211, 153, 0.15);
          border-color: rgba(52, 211, 153, 0.3);
          color: var(--green);
        }

        .action-btn-force:hover:not(:disabled) {
          background: rgba(52, 211, 153, 0.25);
        }

        .action-btn-ignore {
          background: rgba(99, 120, 255, 0.15);
          border-color: rgba(99, 120, 255, 0.3);
          color: var(--text-muted);
        }

        .action-btn-ignore:hover:not(:disabled) {
          background: rgba(99, 120, 255, 0.25);
        }

        .action-btn-unignore {
          background: rgba(52, 211, 153, 0.15);
          border-color: rgba(52, 211, 153, 0.3);
          color: var(--green);
        }

        /* Edit inputs */
        .edit-input {
          background: var(--surface2);
          border: 1px solid var(--border-bright);
          border-radius: 6px;
          padding: 6px 10px;
          font-size: 13px;
          color: var(--text);
          font-family: "JetBrains Mono", monospace;
          width: 100%;
          transition: border-color 0.15s;
        }

        .edit-input:focus {
          outline: none;
          border-color: var(--accent);
        }

        .edit-input.invalid {
          border-color: var(--red);
        }

        /* Filter toggle */
        .filter-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .toggle-switch {
          position: relative;
          width: 44px;
          height: 24px;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .toggle-switch.active {
          background: var(--accent);
          border-color: var(--accent);
        }

        .toggle-knob {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 18px;
          height: 18px;
          background: var(--text);
          border-radius: 50%;
          transition: transform 0.2s;
        }

        .toggle-switch.active .toggle-knob {
          transform: translateX(20px);
          background: #fff;
        }

        .toggle-label {
          font-size: 13px;
          color: var(--text-muted);
        }

        /* Error badge */
        .error-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          background: rgba(248, 113, 113, 0.1);
          border: 1px solid rgba(248, 113, 113, 0.2);
          border-radius: 4px;
          font-size: 11px;
          color: var(--red);
          font-weight: 600;
        }

        .forced-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          background: rgba(52, 211, 153, 0.1);
          border: 1px solid rgba(52, 211, 153, 0.2);
          border-radius: 4px;
          font-size: 11px;
          color: var(--green);
          font-weight: 600;
        }

        .ignored-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          background: rgba(99, 120, 255, 0.1);
          border: 1px solid rgba(99, 120, 255, 0.2);
          border-radius: 4px;
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 600;
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
              <p
                style={{
                  marginTop: "4px",
                  fontSize: "12px",
                  color: "var(--text-muted)",
                }}
              >
                * Төлбөр хамгийн багадаа тасалбарын үнэтэй тэнцүү байх ёстой
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

            {allRows.length > 0 && !previewLoading && (
              <div className="preview-section">
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

                {/* Filter Toggle */}
                <div className="filter-toggle">
                  <div
                    className={`toggle-switch ${showOnlyInvalid ? "active" : ""}`}
                    onClick={() => setShowOnlyInvalid(!showOnlyInvalid)}
                  >
                    <div className="toggle-knob" />
                  </div>
                  <span className="toggle-label">
                    Зөвхөн буруу мөрүүдийг харах ({stats.invalid})
                  </span>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                  <div className="stat-box">
                    <p className="stat-label">Нийт мөр</p>
                    <p className="stat-value total">{stats.total}</p>
                  </div>
                  <div className="stat-box">
                    <p className="stat-label">Хүчинтэй</p>
                    <p className="stat-value valid">{stats.valid}</p>
                  </div>
                  <div className="stat-box">
                    <p className="stat-label">Хүчээр нэмэх</p>
                    <p className="stat-value forced">{stats.forced}</p>
                  </div>
                  <div className="stat-box">
                    <p className="stat-label">Буруу</p>
                    <p className="stat-value invalid">{stats.invalid}</p>
                  </div>
                  <div className="stat-box">
                    <p className="stat-label">Хассан</p>
                    <p
                      className="stat-value ignored"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {stats.ignored}
                    </p>
                  </div>
                  <div className="stat-box">
                    <p className="stat-label">Нийт дүн</p>
                    <p className="stat-value amount">
                      {stats.totalAmount.toLocaleString()}₮
                    </p>
                  </div>
                  <div className="stat-box">
                    <p className="stat-label">Тасалбар тоо</p>
                    <p className="stat-value tickets">
                      ~{stats.expectedTickets.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Preview Table */}
                <table className="preview-table">
                  <thead>
                    <tr>
                      <th style={{ width: "60px" }}>Мөр</th>
                      <th style={{ width: "140px" }}>Огноо</th>
                      <th style={{ width: "100px" }}>Дүн</th>
                      <th style={{ width: "140px" }}>Утас</th>
                      <th>Төлөв</th>
                      <th style={{ width: "200px" }}>Үйлдэл</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayRows.map((row) => {
                      const isEditing = editingRowId === row.id;
                      const isIgnored = row.isIgnored;
                      const isForced = row.isForced;

                      let rowClass = "";
                      if (isIgnored) rowClass = "row-ignored";
                      else if (row.isEdited) rowClass = "row-edited";
                      else if (!row.isValid) rowClass = "row-invalid";

                      return (
                        <tr key={row.id} className={rowClass}>
                          <td
                            style={{
                              color: "var(--text-dim)",
                              fontFamily: "JetBrains Mono, monospace",
                            }}
                          >
                            #{row.rowNumber}
                          </td>
                          <td>
                            {isEditing ? (
                              <input
                                type="text"
                                className="edit-input"
                                value={editValues.date}
                                onChange={(e) =>
                                  setEditValues({
                                    ...editValues,
                                    date: e.target.value,
                                  })
                                }
                                placeholder="Огноо"
                              />
                            ) : (
                              <span className="date">
                                {row.parsed.date || "-"}
                              </span>
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <input
                                type="text"
                                className={`edit-input ${!row.isValid && row.error?.includes("Дүн") ? "invalid" : ""}`}
                                value={editValues.amount}
                                onChange={(e) =>
                                  setEditValues({
                                    ...editValues,
                                    amount: e.target.value,
                                  })
                                }
                                placeholder="Дүн"
                              />
                            ) : (
                              <span className="amount">
                                {row.parsed.amount_paid
                                  ? row.parsed.amount_paid.toLocaleString()
                                  : row.parsed.amount || "-"}
                                ₮
                              </span>
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <input
                                type="text"
                                className={`edit-input ${!row.isValid && row.error?.includes("Утас") ? "invalid" : ""}`}
                                value={editValues.phone}
                                onChange={(e) =>
                                  setEditValues({
                                    ...editValues,
                                    phone: e.target.value,
                                  })
                                }
                                placeholder="Утас"
                              />
                            ) : (
                              <span className="phone">
                                {row.parsed.phone_number ||
                                  row.parsed.phone ||
                                  "-"}
                              </span>
                            )}
                          </td>
                          <td>
                            <div
                              style={{
                                display: "flex",
                                gap: "6px",
                                flexWrap: "wrap",
                              }}
                            >
                              {isIgnored && (
                                <span className="ignored-badge">
                                  <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="18" x2="6" y1="6" y2="18" />
                                    <line x1="6" x2="18" y1="6" y2="18" />
                                  </svg>
                                  Хассан
                                </span>
                              )}
                              {isForced && (
                                <span className="forced-badge">
                                  <svg
                                    width="12"
                                    height="12"
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
                                  Нэмнэ
                                </span>
                              )}
                              {!row.isValid && !isIgnored && !isForced && (
                                <span className="error-badge">
                                  <svg
                                    width="12"
                                    height="12"
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
                                  {row.error}
                                </span>
                              )}
                              {row.isValid && !isIgnored && (
                                <span
                                  style={{
                                    fontSize: "11px",
                                    color: "var(--green)",
                                    fontWeight: 600,
                                  }}
                                >
                                  ✓ Хүчинтэй
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="row-actions">
                              {isIgnored ? (
                                <button
                                  className="action-btn action-btn-unignore"
                                  onClick={() => handleUnignoreRow(row.id)}
                                >
                                  <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <polyline points="1 4 1 10 7 10" />
                                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                                  </svg>
                                  Буцаах
                                </button>
                              ) : isEditing ? (
                                <>
                                  <button
                                    className="action-btn action-btn-save"
                                    onClick={() => handleSaveEdit(row)}
                                  >
                                    <svg
                                      width="12"
                                      height="12"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    Хадгалах
                                  </button>
                                  <button
                                    className="action-btn action-btn-edit"
                                    onClick={handleCancelEdit}
                                  >
                                    Болих
                                  </button>
                                </>
                              ) : (
                                <>
                                  {!row.isValid && (
                                    <button
                                      className="action-btn action-btn-edit"
                                      onClick={() => handleEditRow(row)}
                                    >
                                      <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                        <path d="m15 5 4 4" />
                                      </svg>
                                      Засах
                                    </button>
                                  )}
                                  {!row.isValid && (
                                    <button
                                      className="action-btn action-btn-force"
                                      onClick={() => handleForceRow(row.id)}
                                    >
                                      <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                                        <path d="m9 12 2 2 4-4" />
                                      </svg>
                                      Нэмнэ
                                    </button>
                                  )}
                                  <button
                                    className="action-btn action-btn-ignore"
                                    onClick={() => handleIgnoreRow(row.id)}
                                  >
                                    <svg
                                      width="12"
                                      height="12"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <circle cx="12" cy="12" r="10" />
                                      <line x1="18" x2="6" y1="6" y2="18" />
                                      <line x1="6" x2="18" y1="6" y2="18" />
                                    </svg>
                                    Хасах
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {displayRows.length === 0 && allRows.length > 0 && (
                  <div
                    style={{
                      padding: "24px",
                      textAlign: "center",
                      color: "var(--text-muted)",
                      fontSize: "14px",
                    }}
                  >
                    Буруу мөр байхгүй байна. Бүх мөр хүчинтэй!
                  </div>
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

                <button
                  onClick={handleClearAll}
                  className="submit-btn"
                  style={{
                    marginTop: "16px",
                    background: "var(--surface2)",
                    border: "1px solid var(--border)",
                  }}
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
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                  Шинэ файл сонгох
                </button>
              </div>
            )}

            {/* Import summary */}
            {allRows.length > 0 && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px 16px",
                  background: "rgba(52, 211, 153, 0.08)",
                  border: "1px solid rgba(52, 211, 153, 0.2)",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--green)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  Импорт хийгдэнэ:{" "}
                  <strong style={{ color: "var(--green)" }}>
                    {stats.valid + stats.forced}
                  </strong>{" "}
                  тасалбар
                  {stats.ignored > 0 && (
                    <span
                      style={{ marginLeft: "8px", color: "var(--text-muted)" }}
                    >
                      (хассан: {stats.ignored})
                    </span>
                  )}
                </span>
              </div>
            )}

            <button
              onClick={handleImport}
              disabled={
                importing ||
                !file ||
                allRows.length === 0 ||
                stats.valid + stats.forced === 0
              }
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
                  Импорт хийх ({stats.valid + stats.forced} тасалбар)
                </>
              )}
            </button>
          </div>
        </main>
      </div>
    </>
  );
}
