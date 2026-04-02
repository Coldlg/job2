import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
});

async function main() {
  console.log("Seeding started...");

  // Clear existing data
  await prisma.lottery.deleteMany();

  const lotteries = [
    {
      title: "Lexus RX450 Version L",
      price: 10000,
      description:
        "Нийт 11500 эрхээс 42 азтан тодроно 1️⃣#СУПЕР_АЗТАН_LEXUS_RX450 2️⃣#ЦОО_ШИНЭ_IPHONE\n3️⃣-42 Дараагийн сугалааны 5/5 эрх",
      ticketsSold: 4413,
      maximumTickets: 11500,
      drawDate: new Date("2025-01-20"),
      images: [
        "photos/image1.jpg",
        "photos/image2.jpg",
        "photos/Facebook Image (2).jpg",
        "photos/Facebook Image (3).jpg",
        "photos/Facebook Image (4).jpg",
        "photos/Facebook Image (5).jpg",
        "photos/Facebook Image (6).jpg",
        "photos/Facebook Image (7).jpg",
      ],
      accountNumber: "MN840005005402991420",
      accountName: "Дуламсүрэн",
      bankName: "Хаан банк",
    },
    {
      title: "LC300",
      price: 25000,
      description:
        "Нийт 11500 эрхээс 42 азтан тодроно 1️⃣#СУПЕР_АЗТАН_LAND_CRUISER_300 2️⃣#ЦОО_ШИНЭ_IPHONE\n3️⃣-6️⃣2️⃣Дараагийн сугалааны 10/10 эрх",
      ticketsSold: 1346,
      maximumTickets: 10666,
      drawDate: new Date("2024-12-30"),
      images: [
        "photos2/Facebook Image.jpg",
        "photos2/Facebook Image (1).jpg",
        "photos2/Facebook Image (2).jpg",
        "photos2/Facebook Image (3).jpg",
        "photos2/Facebook Image (4).jpg",
      ],
      accountNumber: "MN170005005402758177",
      accountName: "Цэндсүрэн",
      bankName: "Хаан банк",
    },
  ];

  for (const lottery of lotteries) {
    await prisma.lottery.create({
      data: lottery,
    });
    console.log(`Created lottery: ${lottery.title}`);
  }

  console.log("Seeding finished.");
}

main()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
