-- CreateEnum
CREATE TYPE "public"."EventType" AS ENUM ('INDIVIDUAL', 'TEAM');

-- AlterTable
ALTER TABLE "public"."Event" ADD COLUMN     "guidelines" TEXT,
ADD COLUMN     "type" "public"."EventType";
