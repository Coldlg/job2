// File: scripts/importFromGoogleSheets.ts
// Run this with: tsx scripts/importFromGoogleSheets.ts

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
});

// Configuration
const LOTTERY_ID = 6; // LC300 lottery
const SHEET_ID = "10f8ypL1HkxF7kVOzQaKieue_x7iSzeX3Q5G77awRmDQ";
const SHEET_NAME = "Sheet1"; // Update this to match your sheet tab name
const DEFAULT_TICKET_PRICE = 25000; // LC300 ticket price

async function importFromGoogleSheets() {
  try {
    console.log("Starting import...");

    // Verify lottery exists
    const lottery = await prisma.lottery.findUnique({
      where: { id: LOTTERY_ID },
    });

    if (!lottery) {
      throw new Error(`Lottery with ID ${LOTTERY_ID} not found`);
    }

    console.log(`Importing to lottery: ${lottery.title}`);

    // Get current max ticket number for this lottery
    const maxTicket = await prisma.ticket.findFirst({
      where: { lottery_id: LOTTERY_ID },
      orderBy: { ticket_number: "desc" },
      select: { ticket_number: true },
    });

    let nextTicketNumber = maxTicket ? maxTicket.ticket_number + 1 : 1;
    console.log(`Starting from ticket number: ${nextTicketNumber}`);

    // Fetch data from Google Sheets (public CSV export)
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
      SHEET_NAME
    )}`;

    console.log("Fetching data from Google Sheets...");
    console.log(`URL: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch Google Sheet. Make sure it's publicly accessible. Status: ${response.status}`);
    }

    const csvText = await response.text();
    const rows = csvText.split("\n").slice(1); // Skip header row

    console.log(`Found ${rows.length} rows`);

    // Parse and insert tickets
    const ticketsToInsert: Array<{
      lottery_id: number;
      ticket_number: number;
      phone_number: string;
      amount_paid: number;
      created_at: Date;
    }> = [];

    let skipped = 0;

    for (const row of rows) {
      if (!row.trim()) {
        skipped++;
        continue;
      }

      // Parse CSV row (handle quoted fields)
      const columns = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
      const cleanColumns = columns.map((col) => col.replace(/^"|"$/g, "").trim());

      // Based on your sheet structure:
      // Column A (index 0): text/label
      // Column B (index 1): amount_paid (might be empty)
      // Column C (index 2): phone_number
      const phoneNumber = cleanColumns[2] || null;

      if (!phoneNumber || phoneNumber === "") {
        console.log(`Skipping row - no phone number: ${row}`);
        skipped++;
        continue;
      }

      // Clean phone number (remove spaces, dashes, etc.)
      const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, "");

      // Validate phone number (should be 8 digits)
      if (!/^\d{8}$/.test(cleanPhone)) {
        console.log(`Skipping invalid phone number: ${cleanPhone}`);
        skipped++;
        continue;
      }

      const amountPaid = parseFloat(cleanColumns[1]) || DEFAULT_TICKET_PRICE;

      ticketsToInsert.push({
        lottery_id: LOTTERY_ID,
        ticket_number: nextTicketNumber++,
        phone_number: cleanPhone,
        amount_paid: amountPaid,
        created_at: new Date(),
      });
    }

    console.log(`Valid tickets to insert: ${ticketsToInsert.length}`);
    console.log(`Skipped rows: ${skipped}`);

    if (ticketsToInsert.length === 0) {
      console.log("No tickets to insert. Check your Google Sheet data.");
      return;
    }

    // Batch insert tickets
    let inserted = 0;
    const batchSize = 100;

    for (let i = 0; i < ticketsToInsert.length; i += batchSize) {
      const batch = ticketsToInsert.slice(i, i + batchSize);

      await prisma.ticket.createMany({
        data: batch,
        skipDuplicates: true,
      });

      inserted += batch.length;
      console.log(`Inserted ${inserted}/${ticketsToInsert.length} tickets`);
    }

    // Update lottery ticketsSold count
    const totalTickets = await prisma.ticket.count({
      where: { lottery_id: LOTTERY_ID },
    });

    await prisma.lottery.update({
      where: { id: LOTTERY_ID },
      data: {
        ticketsSold: totalTickets,
      },
    });

    console.log(`\n✅ Successfully imported ${ticketsToInsert.length} tickets to Lottery ID ${LOTTERY_ID}`);
    console.log(
      `📋 Ticket numbers: ${ticketsToInsert[0].ticket_number} to ${
        ticketsToInsert[ticketsToInsert.length - 1].ticket_number
      }`
    );
    console.log(`🎫 Total tickets in lottery: ${totalTickets}`);
  } catch (error) {
    console.error("❌ Import failed:", error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importFromGoogleSheets();
