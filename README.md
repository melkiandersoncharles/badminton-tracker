# Badminton Tracker

Phone-first app for a daily doubles group: matches, scores, attendance, player pages, and a leaderboard.

Everyone uses the **same URL** and logs in with the **group PIN `2580`**.

Until you connect Supabase, scores stay on that one phone. After you host it (below), all phones share the same data.

## Login PIN

The keypad appears whenever `VITE_GROUP_PIN` is set.

- **PIN: `2580`** (change it in `.env` locally and in Vercel if you host)
- After login, the session lasts until the browser tab is closed, or until someone taps **Lock** on the Players tab

Restart `npm run dev` after changing `.env`.

## Run on this computer

```bash
npm install
npm run dev
```

Open the URL, type **2580**, then add people on **Players** and log matches on **Today**.

## Host it on the internet (step by step)

You need three free accounts: **GitHub** (code), **Supabase** (shared scores + photos), **Vercel** (the public website). Group PIN stays **2580**.

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
5. Open the file `supabase/schema.sql` in this project, copy **all** of it, paste into the editor → **Run**. You should see success.
6. Left sidebar → **Project Settings** (gear) → **API**.
7. Copy:
   - **Project URL** (looks like `https://abcdxyz.supabase.co`)
   - **anon public** key (long string starting with `eyJ`)

### C. Put those keys on Vercel (the website)

1. Go to [vercel.com](https://vercel.com) → sign up with the **same GitHub** account.
2. **Add New… → Project** → import `badminton-tracker`.
3. Before you click Deploy, open **Environment Variables** and add all three:

| Name | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | the Project URL from step B |
| `VITE_SUPABASE_ANON_KEY` | the anon public key from step B |
| `VITE_GROUP_PIN` | `2580` |

4. Click **Deploy**. Wait until it finishes.
5. Click **Visit** (or **Domains**). Your public address looks like `https://badminton-tracker-xxxxx.vercel.app`.

If you forgot the env vars, add them under **Settings → Environment Variables**, then **Deployments → ⋮ → Redeploy**.

### D. Give it to the group

Send them:

- The Vercel link
- PIN **2580**

They open the link → type **2580** → use **Today / Shuttle / Players / Board**.

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

- PIN keypad never appears → `VITE_GROUP_PIN` is missing on Vercel; add it and **Redeploy**.
- Yellow banner / data not shared → Supabase URL or anon key is wrong, or schema.sql was not run.
- Shuttle tab says the table is missing → paste and run `supabase/shuttle.sql` in the SQL Editor, then refresh.
- Photo upload fails → confirm the `player-photos` bucket exists (schema.sql creates it).
- Page not found on a player URL → `vercel.json` is in the repo; redeploy after the first GitHub push.

## Notes

- Doubles only, one game per match. Winner is the higher score.
- Attendance is members who appeared in a match that day.
- Shuttle tab tracks a box of 6: remaining, used, and who is holding it.
- Tap a player’s name or photo for their wins, partners, and match list.
- Photos are resized on the phone before upload.
