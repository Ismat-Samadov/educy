# Quick Fix Guide

## Problem
The system settings API is broken due to a missing database column.

## Fix (5 minutes)

### Step 1: Apply Database Migration
Go to your **Vercel Dashboard** → **Storage** → **Postgres** → **Query** tab and run:

```sql
ALTER TABLE "educy"."system_settings" 
ADD COLUMN IF NOT EXISTS "maxEnrollmentsPerStudent" INTEGER;

ALTER TABLE "educy"."system_settings"
ADD CONSTRAINT "system_settings_maxEnrollmentsPerStudent_check" 
CHECK ("maxEnrollmentsPerStudent" IS NULL OR "maxEnrollmentsPerStudent" > 0);
```

### Step 2: Verify
Visit: https://educy.vercel.app/api/admin/system-settings

Should return JSON instead of error.

### Done! ✅

---

For detailed instructions, see: `docs/DEPLOYMENT_FIX_SYSTEM_SETTINGS.md`
