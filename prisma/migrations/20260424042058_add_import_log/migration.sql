-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "import_batch_id" INTEGER;

-- CreateTable
CREATE TABLE "ImportLog" (
    "id" SERIAL NOT NULL,
    "lottery_id" INTEGER NOT NULL,
    "ticket_count" INTEGER NOT NULL,
    "start_ticket" INTEGER NOT NULL,
    "end_ticket" INTEGER NOT NULL,
    "imported_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ImportLog_lottery_id_idx" ON "ImportLog"("lottery_id");

-- CreateIndex
CREATE INDEX "ImportLog_imported_at_idx" ON "ImportLog"("imported_at");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_import_batch_id_fkey" FOREIGN KEY ("import_batch_id") REFERENCES "ImportLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
