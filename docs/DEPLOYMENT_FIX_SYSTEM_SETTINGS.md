# Deployment Guide: Fix System Settings API Error

## Issue Description

The `/api/admin/system-settings` endpoint is returning a 500 error due to a missing database column. The error occurs because:

1. The Prisma schema includes the `maxEnrollmentsPerStudent` field in the `SystemSettings` model
2. The production database does not have this column yet
3. When the API tries to query system settings, Prisma fails with: `The column system_settings.maxEnrollmentsPerStudent does not exist in the current database`

## Solution

Apply the SQL migration to add the missing column to the production database.

## Deployment Steps

### Option 1: Using Vercel Postgres Dashboard (Recommended)

1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your project
3. Go to the **Storage** tab
4. Select your **Postgres** database
5. Click on the **Query** tab
6. Copy and paste the following SQL:

```sql
-- Add maxEnrollmentsPerStudent column to system_settings table
ALTER TABLE "educy"."system_settings" 
ADD COLUMN IF NOT EXISTS "maxEnrollmentsPerStudent" INTEGER;

-- Add a comment to document the column
COMMENT ON COLUMN "educy"."system_settings"."maxEnrollmentsPerStudent" 
IS 'Maximum number of active enrollments allowed per student (NULL = unlimited)';
```

7. Click **Run Query**
8. Verify the column was added successfully

### Option 2: Using psql Command Line

If you have direct database access:

```bash
# Connect to your production database
psql "$DATABASE_URL" -f prisma/migrations/add_maxEnrollmentsPerStudent.sql
```

Or directly:

```bash
psql "$DATABASE_URL" -c "ALTER TABLE educy.system_settings ADD COLUMN IF NOT EXISTS \"maxEnrollmentsPerStudent\" INTEGER;"
```

### Option 3: Using a Database Client (DBeaver, pgAdmin, etc.)

1. Connect to your production PostgreSQL database
2. Navigate to the `educy` schema
3. Find the `system_settings` table
4. Run the SQL from `prisma/migrations/add_maxEnrollmentsPerStudent.sql`

## Verification

After applying the migration, verify the fix:

1. Check that the column exists:
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'educy' 
  AND table_name = 'system_settings' 
  AND column_name = 'maxEnrollmentsPerStudent';
```

Expected result:
```
     column_name         | data_type | is_nullable
-------------------------+-----------+-------------
 maxEnrollmentsPerStudent | integer   | YES
```

2. Test the API endpoint:
   - Visit: `https://educy.vercel.app/api/admin/system-settings`
   - Should return system settings JSON instead of 500 error

3. Test the admin panel:
   - Log in as an admin
   - Navigate to System Settings
   - Verify the page loads without errors

## Rollback (if needed)

If you need to rollback this change:

```sql
ALTER TABLE "educy"."system_settings" 
DROP COLUMN IF EXISTS "maxEnrollmentsPerStudent";
```

**Note**: Only rollback if absolutely necessary and if no data has been set for this field.

## Future Migrations

To prevent this issue in the future:

1. Always test schema changes locally first with `npm run db:push`
2. Create SQL migration files for production in `prisma/migrations/`
3. Apply migrations to production before deploying code changes
4. Document all migrations in `prisma/migrations/README.md`

## Technical Details

- **Schema Location**: `prisma/schema.prisma` (line 701)
- **Migration File**: `prisma/migrations/add_maxEnrollmentsPerStudent.sql`
- **API Route**: `app/api/admin/system-settings/route.ts`
- **Database Schema**: `educy`
- **Table**: `system_settings`
- **Column Type**: INTEGER (nullable)
