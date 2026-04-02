import "dotenv/config";
import { PrismaClient } from "../../../generated/prisma";

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { lotteryId, phone } = req.query;

  if (!lotteryId || !phone) {
    return res.status(400).json({ error: "Missing lotteryId or phone" });
  }

  try {
    // Clean the phone number - remove spaces and non-digit characters
    const cleanPhone = phone.replace(/\D/g, "");

    const tickets = await prisma.ticket.findMany({
      where: {
        lottery_id: parseInt(lotteryId),
        phone_number: {
          contains: cleanPhone,
        },
      },
      orderBy: {
        ticket_number: "asc",
      },
      select: {
        id: true,
        ticket_number: true,
        phone_number: true,
        amount_paid: true,
        created_at: true,
      },
    });

    // Convert Decimal to number for JSON serialization
    const serializedTickets = tickets.map((ticket) => ({
      ...ticket,
      amount_paid: parseFloat(ticket.amount_paid.toString()),
      created_at: ticket.created_at.toISOString(),
    }));

    return res.status(200).json({ tickets: serializedTickets });
  } catch (error) {
    console.error("Error searching tickets:", error);
    return res.status(500).json({ error: "Failed to search tickets" });
  }
}
