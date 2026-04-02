import "dotenv/config";
import { PrismaClient } from "../../../../generated/prisma";

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  const { id } = req.query;
  const lotteryId = parseInt(id);

  if (req.method === "GET") {
    try {
      const lottery = await prisma.lottery.findUnique({
        where: { id: lotteryId },
      });

      if (!lottery) {
        return res.status(404).json({ error: "Lottery not found" });
      }

      return res.status(200).json({ lottery: { ...lottery, drawDate: lottery.drawDate.toISOString() } });
    } catch (error) {
      console.error("Error fetching lottery:", error);
      return res.status(500).json({ error: "Failed to fetch lottery" });
    }
  }

  if (req.method === "PUT") {
    try {
      const {
        title,
        description,
        price,
        ticketsSold,
        maximumTickets,
        drawDate,
        images,
        accountNumber,
        accountName,
        bankName,
      } = req.body;

      const lottery = await prisma.lottery.update({
        where: { id: lotteryId },
        data: {
          title,
          description: description || "",
          price: parseInt(price),
          ticketsSold: parseInt(ticketsSold || 0),
          maximumTickets: parseInt(maximumTickets),
          drawDate: new Date(drawDate),
          images: images || [],
          accountNumber: accountNumber || null,
          accountName: accountName || null,
          bankName: bankName || null,
          isHidden: req.body.isHidden === true,
        },
      });

      return res.status(200).json({ lottery: { ...lottery, drawDate: lottery.drawDate.toISOString() } });
    } catch (error) {
      console.error("Error updating lottery:", error);
      return res.status(500).json({ error: "Failed to update lottery" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.lottery.delete({
        where: { id: lotteryId },
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting lottery:", error);
      return res.status(500).json({ error: "Failed to delete lottery" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
