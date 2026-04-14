import "dotenv/config";
import { PrismaClient } from "../../../../../generated/prisma";
import * as XLSX from "xlsx";

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;
  const lottery_id = parseInt(id);

  try {
    const lottery = await prisma.lottery.findUnique({
      where: { id: lottery_id },
    });

    if (!lottery) {
      return res.status(404).json({ error: "Lottery not found" });
    }

    const tickets = await prisma.ticket.findMany({
      where: { lottery_id },
      orderBy: { ticket_number: "asc" },
    });

    // Excel data with proper headers
    const data = tickets.map((ticket) => ({
      "ID": ticket.id,
      "Тасалбарын дугаар": ticket.ticket_number,
      "Утасны дугаар": ticket.phone_number,
      "Дүн": parseFloat(ticket.amount_paid.toString()),
      "Огноо": new Date(ticket.created_at).toLocaleDateString("mn-MN"),
      "Цаг": new Date(ticket.created_at).toLocaleTimeString("mn-MN"),
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Set column widths
    ws["!cols"] = [
      { wch: 10 }, // ID
      { wch: 20 }, // Ticket number
      { wch: 20 }, // Phone
      { wch: 15 }, // Amount
      { wch: 15 }, // Date
      { wch: 12 }, // Time
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Тасалбарууд");

    // Generate buffer and send
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${lottery.title.replace(/[^a-z0-9]/gi, "_")}_tickets.xlsx"`,
    );
    res.setHeader("Content-Length", buffer.length);

    return res.send(buffer);
  } catch (error) {
    console.error("Error exporting tickets:", error);
    return res.status(500).json({ error: "Failed to export tickets" });
  }
}
