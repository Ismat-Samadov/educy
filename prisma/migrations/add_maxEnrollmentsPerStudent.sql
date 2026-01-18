-- Migration: Add maxEnrollmentsPerStudent column to system_settings table
-- Date: 2026-01-18
-- Description: This migration adds the maxEnrollmentsPerStudent column to allow limiting
--              the number of active enrollments per student

-- Add the column with NULL default (optional field)
ALTER TABLE "educy"."system_settings" 
ADD COLUMN IF NOT EXISTS "maxEnrollmentsPerStudent" INTEGER;

-- Add a constraint to ensure positive values (matching API validation)
ALTER TABLE "educy"."system_settings"
ADD CONSTRAINT "system_settings_maxEnrollmentsPerStudent_check" 
CHECK ("maxEnrollmentsPerStudent" IS NULL OR "maxEnrollmentsPerStudent" > 0);

-- Add a comment to document the column
COMMENT ON COLUMN "educy"."system_settings"."maxEnrollmentsPerStudent" 
IS 'Maximum number of active enrollments allowed per student (NULL = unlimited)';
