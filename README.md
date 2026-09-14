# Badminton Tracker

Phone-first app for a daily doubles group: matches, scores, attendance, player pages, and a leaderboard.

One deployment can serve **multiple teams**. Each team has its own PIN; all data is isolated by `team_id`.

Until you connect Supabase, scores stay on that one phone. After you host it (below), all phones sharing the same team PIN see the same data.

## Login PIN

- **Default team PIN: `2580`** (for the original club after migration)
- With **Supabase**: the app looks up your PIN in the `teams` table. Different groups can have different PINs on the same URL.
- Without Supabase: falls back to `VITE_GROUP_PIN` in `.env` (local-only mode on one phone).
- After login, the session lasts until the tab is closed, or until someone taps **Lock** on the Players tab (clears team + operator).

Restart `npm run dev` after changing `.env`.

## Multi-team setup

### New Supabase project

Run `supabase/schema.sql` in the SQL Editor. It creates a `teams` table and seeds **Default Club** with PIN `2580`.

### Existing live Supabase (upgrade)

1. **Back up first** — see `supabase/backup/README.md`.
2. Run `supabase/backup/pre-multiteam-backup.sql` in the SQL Editor.
3. Run `supabase/multiteam.sql` in a new query.
4. Redeploy the app (or pull latest `feature/multiteam` / main after merge).

Existing players, matches, shuttle boxes, and activity are assigned to **Default Club** (PIN `2580`). Nothing is deleted.

### Add another team

In Supabase SQL Editor:

```sql
insert into public.teams (name, pin)
values ('Tuesday Night Group', '4321')
on conflict (pin) do nothing;
```

Share the new PIN with that group. They use the **same app URL**; only the PIN differs.

See also `supabase/seed-second-team.sql` for a copy-paste example.

## Run on this computer

```bash
npm install
npm run dev
```

Open the URL, type your team PIN, then add people on **Players** and log matches on **Today**.

## Host it on the internet (step by step)

You need three free accounts: **GitHub** (code), **Supabase** (shared scores + photos), **Vercel** (the public website).

### A. Save the code on GitHub

1. Create a GitHub account at [github.com](https://github.com) if you don’t have one.
2. Click **New repository**. Name it `badminton-tracker`. Leave it empty (no README). Create.
3. On this PC, in Cursor/terminal, from `C:\Users\melc\Projects\badminton-tracker`:

```bash
git add .
git commit -m "Add badminton tracker"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/badminton-tracker.git
git push -u origin main
```

Replace `YOUR_GITHUB_USERNAME` with your GitHub name. Sign in if GitHub asks.

### B. Create the shared database (Supabase)

1. Go to [supabase.com](https://supabase.com) → **Start your project** → sign in (GitHub login is easiest).
2. **New project**. Pick an org, name it e.g. `badminton`, set a database password (save it), region close to you → **Create**.
3. Wait until the project is ready.
4. Left sidebar → **SQL Editor** → **New query**.
5. Open `supabase/schema.sql`, copy **all** of it, paste into the editor → **Run**. You should see success.
6. Left sidebar → **Project Settings** (gear) → **API**.
7. Copy:
   - **Project URL** (looks like `https://abcdxyz.supabase.co`)
   - **anon public** key (long string starting with `eyJ`)

### C. Put those keys on Vercel (the website)

1. Go to [vercel.com](https://vercel.com) → sign up with the **same GitHub** account.
2. **Add New… → Project** → import `badminton-tracker`.
3. Before you click Deploy, open **Environment Variables** and add:

| Name | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | the Project URL from step B |
| `VITE_SUPABASE_ANON_KEY` | the anon public key from step B |
| `VITE_GROUP_PIN` | `2580` (optional fallback for local-only dev without Supabase) |

4. Click **Deploy**. Wait until it finishes.
5. Click **Visit** (or **Domains**). Your public address looks like `https://badminton-tracker-xxxxx.vercel.app`.

If you forgot the env vars, add them under **Settings → Environment Variables**, then **Deployments → ⋮ → Redeploy**.

### D. Give it to the group

Send them:

- The Vercel link
- Their team PIN (e.g. **2580** for Default Club)

They open the link → enter PIN → use **Today / Shuttle / Players / Board**.

On a phone, add a home-screen icon:

- **iPhone:** Safari → Share → **Add to Home Screen**
- **Android:** Chrome menu → **Add to Home Screen** / **Install app**

### E. Optional: same keys on your PC

So local testing also talks to the shared database, edit `.env` in the project folder:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GROUP_PIN=2580
```

Then restart `npm run dev`. The yellow “this phone only” banner should disappear.

### If something fails

- PIN keypad never appears → Supabase is not configured and `VITE_GROUP_PIN` is missing; add one or both, then **Redeploy**.
- Wrong PIN with Supabase → run `multiteam.sql` if upgrading; confirm the team row exists: `select * from teams;`
- Yellow banner / data not shared → Supabase URL or anon key is wrong, or schema was not run.
- Shuttle tab says the table is missing → paste and run `supabase/shuttle.sql`, then `multiteam.sql` if needed.
- Photo upload fails → confirm the `player-photos` bucket exists (schema.sql creates it).
- Page not found on a player URL → `vercel.json` is in the repo; redeploy after the first GitHub push.

## Notes

- Doubles only, one game per match. Winner is the higher score.
- Attendance is members who appeared in a match that day.
- On Today, before any match is logged: Sat/Sun/Mon show last week’s best; Tue–Fri show yesterday’s. After the first match today, that becomes today’s match count, best player, and best team.
- Shuttle tab: any number of boxes (6 shuttles each). Each box belongs to a member; one member can hold several boxes.
- Tap a player’s name or photo for their wins, partners, and match list.
- Photos are resized on the phone before upload.
