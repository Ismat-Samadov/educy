-- AlterTable
-- Add maxEnrollmentsPerStudent column to system_settings table
-- This column allows admins to set a limit on the number of active enrollments per student
ALTER TABLE "educy"."system_settings" ADD COLUMN "maxEnrollmentsPerStudent" INTEGER;
