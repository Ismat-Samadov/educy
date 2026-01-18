# Pull Request Summary

## Issue Fixed
**Title**: `/api/admin/system-settings` endpoint returning 500 error  
**Error**: `The column system_settings.maxEnrollmentsPerStudent does not exist in the current database`

## Root Cause
Database schema mismatch - the Prisma schema defines `maxEnrollmentsPerStudent` field but the production database doesn't have this column.

## Solution Overview
Created SQL migration script and comprehensive documentation to add the missing database column. No code changes were required as the application code is already correct.

## Files Changed

### New Files
1. **`prisma/migrations/add_maxEnrollmentsPerStudent.sql`** (17 lines)
   - Adds `maxEnrollmentsPerStudent` INTEGER column
   - Adds CHECK constraint (NULL or > 0) matching API validation
   - Includes column documentation comment
   - Idempotent (uses IF NOT EXISTS)

2. **`prisma/migrations/README.md`** (53 lines)
   - Documents the migration system
   - Explains when and how to apply migrations
   - Lists current migrations with context

3. **`docs/DEPLOYMENT_FIX_SYSTEM_SETTINGS.md`** (127 lines)
   - Detailed deployment guide with 3 methods:
     - Vercel Dashboard (recommended)
     - psql command line
     - GUI database clients
   - Verification steps
   - Rollback instructions
   - Technical details

4. **`QUICKFIX.md`** (29 lines)
   - Quick reference for immediate fix
   - 5-minute deployment guide
   - Links to detailed documentation

### Modified Files
1. **`.gitignore`** (+4 lines)
   - Updated to allow SQL migration files
   - Still ignores auto-generated migration folders

## Deployment Steps

### Required Action
After merging this PR, the database migration must be applied:

1. Go to **Vercel Dashboard** → **Storage** → **Postgres** → **Query**
2. Run the SQL from `prisma/migrations/add_maxEnrollmentsPerStudent.sql`
3. Verify at https://educy.vercel.app/api/admin/system-settings

See `QUICKFIX.md` for detailed steps.

## Technical Details

- **Schema**: educy
- **Table**: system_settings
- **Column**: maxEnrollmentsPerStudent INTEGER
- **Constraint**: NULL or > 0
- **API Validation**: Already in place (min: 1, max: 20)
- **Prisma Schema**: Already correct (line 701)

## Testing & Verification

### Before Fix
- API returns: 500 Internal Server Error
- Error: Column doesn't exist

### After Fix (Expected)
- API returns: 200 OK with system settings JSON
- Field accessible in admin panel

### Verification Commands
```sql
-- Check column exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'educy' 
  AND table_name = 'system_settings' 
  AND column_name = 'maxEnrollmentsPerStudent';
```

## Risk Assessment

- **Risk Level**: Low
- **Breaking Changes**: None
- **Rollback**: Simple (documented)
- **Impact**: Fixes broken admin functionality

## Code Quality

- ✅ No security issues (CodeQL)
- ✅ No code changes required
- ✅ Migration is idempotent
- ✅ Constraint matches API validation
- ✅ Comprehensive documentation
- ✅ Multiple deployment options provided

## Related Files (Context)

- `prisma/schema.prisma` (line 701) - Field definition
- `app/api/admin/system-settings/route.ts` - API endpoint
- Line 46: Zod validation: `z.number().min(1).max(20).optional().nullable()`

## Commits

1. `2028944` - Initial plan
2. `623f42d` - Add database migration script for maxEnrollmentsPerStudent column
3. `1723b2d` - Add comprehensive deployment documentation and quick fix guide
4. `88a404f` - Add database constraint for maxEnrollmentsPerStudent validation
5. `d98967a` - Revert unrelated package-lock.json changes
6. `e5991b6` - Update constraint to match API validation (positive values only)

## Security Summary

No security vulnerabilities introduced or fixed. This PR only adds database schema documentation and migration scripts.
