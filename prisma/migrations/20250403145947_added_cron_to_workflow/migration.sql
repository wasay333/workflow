-- AlterTable
ALTER TABLE "Workflow" ADD COLUMN "NextRunAt" DATETIME;
ALTER TABLE "Workflow" ADD COLUMN "cron" TEXT;
