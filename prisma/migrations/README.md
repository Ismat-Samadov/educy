# Database Migrations

This directory contains SQL migration scripts for the Educy database.

## Overview

The project uses Prisma with `prisma db push` for development, but migrations are gitignored by default. However, critical migrations that need to be applied to production are stored here.

## Applying Migrations

### For Production (Vercel)

When deploying to Vercel, migrations need to be applied manually to the production database:

1. Connect to your production PostgreSQL database
2. Run the SQL migration files in order

### For Local Development

For local development, you can use:

```bash
npm run db:push
```

This will sync your local database with the Prisma schema.

## Current Migrations

### add_maxEnrollmentsPerStudent.sql
- **Date**: 2026-01-18
- **Description**: Adds the `maxEnrollmentsPerStudent` column to the `system_settings` table
- **Required for**: System Settings API endpoint (`/api/admin/system-settings`)

**How to apply to production:**

```sql
-- Connect to your production database and run:
\i prisma/migrations/add_maxEnrollmentsPerStudent.sql
```

Or using psql from command line:

```bash
psql $DATABASE_URL -f prisma/migrations/add_maxEnrollmentsPerStudent.sql
```

## Important Notes

- Always backup your database before applying migrations
- Test migrations on a staging environment first
- Migrations in this folder should not be deleted once applied to production
- New migrations should include the date and a clear description
