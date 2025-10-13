# Database Management with Supabase CLI

This project uses Supabase CLI to manage database schema changes and version control.

## Prerequisites

- Supabase CLI installed (`brew install supabase/tap/supabase` on macOS)
- Project linked to Supabase (`supabase link`)

## Available Scripts

### Local Development

```bash
# Start local Supabase instance (includes PostgreSQL, GoTrue, etc.)
bun run db:start

# Stop local Supabase instance
bun run db:stop

# Check status of local Supabase services
bun run db:status

# Reset local database to latest migration
bun run db:reset
```

### Migrations

```bash
# Create a new migration file
bun run db:migration:new <migration_name>

# List all migrations and their status
bun run db:migration:list

# Apply pending migrations to local database
bun run db:migration:up
```

### Schema Management

```bash
# Generate a diff of local changes vs. current migration
bun run db:diff

# Pull schema from remote database (creates new migration)
bun run db:pull

# Push local migrations to remote database
bun run db:push
```

### Type Generation

```bash
# Generate TypeScript types from database schema
bun run gen:supabase
```

## Workflow

### Making Database Changes

1. **Create a new migration**:

   ```bash
   bun run db:migration:new add_users_table
   ```

   This creates a new file in `supabase/migrations/` with a timestamp prefix.

2. **Edit the migration file**:
   Add your SQL statements to create, alter, or drop tables/columns.

3. **Apply the migration locally**:

   ```bash
   bun run db:reset
   ```

   Or start fresh:

   ```bash
   bun run db:start
   ```

4. **Generate TypeScript types**:

   ```bash
   bun run gen:supabase
   ```

   This updates `src/integrations/supabase/types.ts` with the new schema.

5. **Test your changes**:
   Verify your application works with the new schema.

6. **Push to remote** (production):
   ```bash
   bun run db:push
   ```
   This applies all pending migrations to your remote Supabase database.

### Pulling Changes from Remote

If changes were made directly to the remote database:

```bash
bun run db:pull
```

This creates a new migration file with the differences.

### Generating a Diff

To see what changes you've made to your local database that aren't in migrations:

```bash
bun run db:diff -f <migration_name>
```

This generates a new migration file with the differences.

## Best Practices

1. **Never edit migration files after they've been applied** - create a new migration instead
2. **Always test migrations locally** before pushing to production
3. **Keep migrations small and focused** - one logical change per migration
4. **Use descriptive migration names** - e.g., `add_user_avatar_column` not `update_users`
5. **Generate types after schema changes** - run `bun run gen:supabase`
6. **Version control** - commit migration files to git
7. **Review migrations in PR** - database changes should be reviewed like code

## Troubleshooting

### Migration history out of sync

If you see errors about migration history:

```bash
supabase migration repair --status reverted <migration_id>
```

### Local start fails with "container is not ready: unhealthy"

If `bun run db:start` fails with vector/analytics container errors on macOS, analytics has been disabled in `supabase/config.toml`:

```toml
[analytics]
enabled = false
```

This is a known issue on macOS where the Vector container can't access Docker's socket.

### Reset everything

To start fresh (⚠️ destroys local data):

```bash
bun run db:stop
bun run db:start
```

## Migration File Location

All migrations are stored in:

```
supabase/migrations/
```

Each file is named with a timestamp: `YYYYMMDDHHMMSS_description.sql`

## Additional Resources

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Database Migrations Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [TypeScript Type Generation](https://supabase.com/docs/guides/api/generating-types)
