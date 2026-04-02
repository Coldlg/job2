import "dotenv/config";
import { PrismaClient } from "../../../../generated/prisma";

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  if (req.method === "GET") {
    // List all lotteries
    try {
      const lotteries = await prisma.lottery.findMany({
        orderBy: { id: "desc" },
      });

      const serialized = lotteries.map((l) => ({
        ...l,
        drawDate: l.drawDate.toISOString(),
      }));

      return res.status(200).json({ lotteries: serialized });
    } catch (error) {
      console.error("Error fetching lotteries:", error);
      return res.status(500).json({ error: "Failed to fetch lotteries" });
    }
  }

  if (req.method === "POST") {
    // Create new lottery
    try {
      const { title, description, price, maximumTickets, drawDate, images, accountNumber, accountName, bankName } =
        req.body;

      const lottery = await prisma.lottery.create({
        data: {
          title,
          description: description || "",
          price: parseInt(price),
          ticketsSold: 0,
          maximumTickets: parseInt(maximumTickets),
          drawDate: new Date(drawDate),
          images: images || [],
          accountNumber: accountNumber || null,
          accountName: accountName || null,
          bankName: bankName || null,
          isHidden: req.body.isHidden === true,
        },
      });

      return res.status(201).json({ lottery: { ...lottery, drawDate: lottery.drawDate.toISOString() } });
    } catch (error) {
      console.error("Error creating lottery:", error);
      return res.status(500).json({ error: "Failed to create lottery" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
