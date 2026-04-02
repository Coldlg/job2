-- AlterTable
ALTER TABLE "Lottery" ADD COLUMN     "accountName" TEXT,
ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Ticket" (
    "id" SERIAL NOT NULL,
    "lottery_id" INTEGER NOT NULL,
    "ticket_number" INTEGER NOT NULL,
    "phone_number" TEXT NOT NULL,
    "amount_paid" DECIMAL(10,2) NOT NULL,
    "is_winner" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Ticket_lottery_id_idx" ON "Ticket"("lottery_id");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_lottery_id_ticket_number_key" ON "Ticket"("lottery_id", "ticket_number");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_lottery_id_fkey" FOREIGN KEY ("lottery_id") REFERENCES "Lottery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
