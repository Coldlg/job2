import "dotenv/config";
import { PrismaClient } from "../../../../generated/prisma";

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { lotteryId, page = 1, limit = 50 } = req.query;

    try {
      const where = lotteryId ? { lottery_id: parseInt(lotteryId) } : {};

      const [tickets, total] = await Promise.all([
        prisma.ticket.findMany({
          where,
          orderBy: { ticket_number: "asc" },
          skip: (parseInt(page) - 1) * parseInt(limit),
          take: parseInt(limit),
          include: {
            lottery: {
              select: { title: true },
            },
          },
        }),
        prisma.ticket.count({ where }),
      ]);

      const serialized = tickets.map((t) => ({
        ...t,
        amount_paid: parseFloat(t.amount_paid.toString()),
        created_at: t.created_at.toISOString(),
      }));

      return res.status(200).json({
        tickets: serialized,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
      });
    } catch (error) {
      console.error("Error fetching tickets:", error);
      return res.status(500).json({ error: "Failed to fetch tickets" });
    }
  }

  if (req.method === "POST") {
    try {
      const { lottery_id, ticket_number, phone_number, amount_paid } = req.body;

      const ticket = await prisma.ticket.create({
        data: {
          lottery_id: parseInt(lottery_id),
          ticket_number: parseInt(ticket_number),
          phone_number,
          amount_paid: parseFloat(amount_paid),
          is_winner: false,
        },
      });

      // Update lottery ticketsSold
      await prisma.lottery.update({
        where: { id: parseInt(lottery_id) },
        data: {
          ticketsSold: { increment: 1 },
        },
      });

      return res.status(201).json({
        ticket: {
          ...ticket,
          amount_paid: parseFloat(ticket.amount_paid.toString()),
          created_at: ticket.created_at.toISOString(),
        },
      });
    } catch (error) {
      console.error("Error creating ticket:", error);
      if (error.code === "P2002") {
        return res.status(400).json({ error: "Ticket number already exists for this lottery" });
      }
      return res.status(500).json({ error: "Failed to create ticket" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
