import "dotenv/config";
import { PrismaClient } from "../../../../generated/prisma";

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  const { id } = req.query;
  const ticketId = parseInt(id);

  if (req.method === "GET") {
    try {
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
          lottery: {
            select: { title: true },
          },
        },
      });

      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      return res.status(200).json({
        ticket: {
          ...ticket,
          amount_paid: parseFloat(ticket.amount_paid.toString()),
          created_at: ticket.created_at.toISOString(),
        },
      });
    } catch (error) {
      console.error("Error fetching ticket:", error);
      return res.status(500).json({ error: "Failed to fetch ticket" });
    }
  }

  if (req.method === "PUT") {
    try {
      const { phone_number, amount_paid, is_winner } = req.body;

      const ticket = await prisma.ticket.update({
        where: { id: ticketId },
        data: {
          phone_number,
          amount_paid: parseFloat(amount_paid),
          is_winner: is_winner || false,
        },
      });

      return res.status(200).json({
        ticket: {
          ...ticket,
          amount_paid: parseFloat(ticket.amount_paid.toString()),
          created_at: ticket.created_at.toISOString(),
        },
      });
    } catch (error) {
      console.error("Error updating ticket:", error);
      return res.status(500).json({ error: "Failed to update ticket" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
      });

      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      await prisma.ticket.delete({
        where: { id: ticketId },
      });

      // Update lottery ticketsSold
      await prisma.lottery.update({
        where: { id: ticket.lottery_id },
        data: {
          ticketsSold: { decrement: 1 },
        },
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting ticket:", error);
      return res.status(500).json({ error: "Failed to delete ticket" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
