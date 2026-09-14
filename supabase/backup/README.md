# Supabase backup before multi-team migration

**Run this before applying `supabase/multiteam.sql` on a live database.**

## Steps

1. Open your Supabase project → **SQL Editor** → **New query**.
2. Paste the full contents of `pre-multiteam-backup.sql` and click **Run**.
3. Confirm success (no errors). Backup tables are created in `public`:
   - `backup_players`
   - `backup_matches`
   - `backup_shuttle_boxes`
   - `backup_activity_log` (only if `activity_log` exists)
4. Run `supabase/multiteam.sql` in a **new** query.
5. Spot-check row counts: backup tables vs live tables (after migration, live rows should match backup counts and all should have `team_id` set).

## Restore (if something goes wrong)

Only if you need to roll back **before** dropping backup tables:

```sql
-- Example: restore players (repeat pattern for other tables)
truncate public.players;
insert into public.players select * from public.backup_players;
```

Adjust column lists if you already ran partial migration. Prefer fixing forward with `multiteam.sql` when possible.

## Optional export

For an off-site copy: Supabase Dashboard → **Database** → **Backups**, or use `pg_dump` / Table Editor → Export CSV per table.
