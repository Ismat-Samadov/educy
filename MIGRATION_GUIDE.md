# Database Migration Guide

## Applying the maxEnrollmentsPerStudent Migration

This guide explains how to apply the database migration that adds the `maxEnrollmentsPerStudent` column to the `system_settings` table.

### Problem Fixed
The production database was missing the `maxEnrollmentsPerStudent` column that exists in the Prisma schema, causing the `/api/admin/system-settings` endpoint to fail with:
```
PrismaClientKnownRequestError: Invalid `prisma.systemSettings.findFirst()` invocation:
The column `system_settings.maxEnrollmentsPerStudent` does not exist in the current database.
```

### Solution
A database migration has been created to add the missing column.

## Deployment Steps

### For Production (Vercel, AWS Lambda, etc.)

1. **Pull the latest changes:**
   ```bash
   git pull origin main
   ```

2. **Apply the migration:**
   ```bash
   npx prisma migrate deploy
   ```
   
   This will:
   - Apply the migration to add the `maxEnrollmentsPerStudent` column
   - Update the `_prisma_migrations` table to track the migration

3. **Regenerate Prisma Client (if needed):**
   ```bash
   npx prisma generate
   ```

4. **Redeploy your application**

### For Development/Local Environment

1. **Pull the latest changes:**
   ```bash
   git pull origin main
   ```

2. **Apply the migration:**
   ```bash
   npx prisma migrate dev
   ```
   
   This will apply the migration and regenerate the Prisma client automatically.

### Verification

After applying the migration, verify it was successful:

1. **Check the column exists:**
   ```sql
   SELECT column_name, data_type, is_nullable 
   FROM information_schema.columns 
   WHERE table_schema = 'educy' 
   AND table_name = 'system_settings' 
   AND column_name = 'maxEnrollmentsPerStudent';
   ```

2. **Test the API endpoint:**
   - Navigate to your admin panel
   - Go to System Settings
   - Verify the page loads without errors
   - Try updating the "Max Enrollments Per Student" field

## Migration Details

- **Migration Name:** `20260118123516_add_max_enrollments_per_student`
- **SQL Command:** `ALTER TABLE "educy"."system_settings" ADD COLUMN "maxEnrollmentsPerStudent" INTEGER;`
- **Column Type:** INTEGER (nullable)
- **Default Value:** NULL (unlimited enrollments)

## Rollback (If Needed)

If you need to rollback this migration:

```sql
ALTER TABLE "educy"."system_settings" DROP COLUMN "maxEnrollmentsPerStudent";
```

⚠️ **Warning:** Rolling back will remove the column and any data stored in it.

## Troubleshooting

### Error: "Migration failed to apply"
- Check database connection
- Ensure you have ALTER TABLE permissions
- Verify the column doesn't already exist

### Error: "Prisma client out of sync"
- Run `npx prisma generate` to regenerate the client
- Restart your development server

### Production deployment still failing
- Check that the migration was applied: `npx prisma migrate status`
- Verify environment variables are correct
- Check application logs for detailed error messages

## Additional Resources

- [Prisma Migration Documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Migration File Location](./prisma/migrations/20260118123516_add_max_enrollments_per_student/)
- [System Settings API](./app/api/admin/system-settings/route.ts)
