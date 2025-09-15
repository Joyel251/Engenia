/*
  Warnings:

  - Added the required column `division` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."EventDivision" AS ENUM ('ONSTAGE', 'OFFSTAGE');

-- AlterTable
ALTER TABLE "public"."Event" ADD COLUMN     "division" "public"."EventDivision" NOT NULL,
ADD COLUMN     "points" JSONB NOT NULL DEFAULT '{}';
