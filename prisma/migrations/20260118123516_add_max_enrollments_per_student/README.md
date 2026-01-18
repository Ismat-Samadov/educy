# Migration: Add maxEnrollmentsPerStudent Column

## Purpose
This migration adds the `maxEnrollmentsPerStudent` column to the `system_settings` table. This column allows administrators to set a limit on the number of active enrollments a student can have at one time.

## Changes
- Adds `maxEnrollmentsPerStudent` (INTEGER, nullable) column to the `system_settings` table
- Default value is NULL (unlimited enrollments)

## How to Apply

### Development
```bash
npx prisma migrate dev
```

### Production
```bash
npx prisma migrate deploy
```

## Rollback
If you need to rollback this migration:
```sql
ALTER TABLE "educy"."system_settings" DROP COLUMN "maxEnrollmentsPerStudent";
```

## Related Files
- `prisma/schema.prisma` - Schema definition (line 701)
- `app/api/admin/system-settings/route.ts` - API endpoint using this field
