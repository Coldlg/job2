import "dotenv/config";
import { PrismaClient } from "../../../../generated/prisma";

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { lotteryId, tickets } = req.body;

    if (!lotteryId || !Array.isArray(tickets)) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    // Get lottery price
    const lottery = await prisma.lottery.findUnique({
      where: { id: parseInt(lotteryId) },
    });

    if (!lottery) {
      return res.status(404).json({ error: "Lottery not found" });
    }

    const price = lottery.price;

    // Get current max ticket number
    const maxTicket = await prisma.ticket.findFirst({
      where: { lottery_id: parseInt(lotteryId) },
      orderBy: { ticket_number: "desc" },
    });

    let nextNumber = maxTicket ? maxTicket.ticket_number + 1 : 1;

    const createInputs = [];
    const errors = [];

    tickets.forEach((ticketData, index) => {
      const { phone_number, amount_paid, created_at } = ticketData;
      const amount = parseFloat(amount_paid);
      const ticketCount = Math.floor(amount / price);

      if (ticketCount < 1) {
        errors.push({ row: index + 1, reason: `Amount too low (${amount})` });
        return;
      }

      const normalizeDate = (s) => {
        if (typeof s !== "string") return null;
        const candidate = s.includes("T") ? s : s.replace(" ", "T");
        const date = new Date(candidate);
        return isNaN(date.getTime()) ? null : date;
      };

      const createdAtDate = normalizeDate(created_at);
      if (!createdAtDate) {
        errors.push({ row: index + 1, reason: `Invalid date (${created_at})` });
        return;
      }

      const pricePerTicket = amount / ticketCount;

      for (let i = 0; i < ticketCount; i++) {
        createInputs.push({
          lottery_id: parseInt(lotteryId),
          ticket_number: nextNumber++,
          phone_number,
          amount_paid: pricePerTicket,
          is_winner: false,
          created_at: createdAtDate,
        });
      }
    });

    if (createInputs.length === 0) {
      return res.status(400).json({
        error: "No tickets to create",
        details: errors,
      });
    }

    let createdCount = 0;
    try {
      const createManyResult = await prisma.ticket.createMany({
        data: createInputs,
        skipDuplicates: true,
      });
      createdCount = createManyResult.count;
    } catch (err) {
      console.error("Ticket createMany error:", err);
      return res.status(500).json({
        error: "Failed to create tickets",
        details: err.message,
      });
    }

    // Update lottery ticketsSold
    if (createdCount > 0) {
      await prisma.lottery.update({
        where: { id: parseInt(lotteryId) },
        data: {
          ticketsSold: { increment: createdCount },
        },
      });
    }

    return res.status(201).json({
      message: `${createdCount} tickets created`,
      createdCount,
      errors,
    });
  } catch (error) {
    console.error("Error importing tickets:", error);
    return res.status(500).json({ error: "Failed to import tickets" });
  }
}
