# ToneOut: Waitlist Website

Landing page and waitlist for ToneOut, an ad free police/fire/EMS scanner app for iOS with Dual Listen and Push to Talk.

## Stack

- Next.js 16 (App Router)
- Tailwind CSS v3
- Clerk Authentication
- Vercel

## Setup

1. Clone the repo
2. Copy `.env.example` to `.env.local` and add your Clerk keys
3. `npm install`
4. `npm run dev`

## Deploy

Push to GitHub, connect in the Vercel dashboard, add environment variables, deploy.

## Pages

- `/`: Waitlist landing page
- `/news`: Live fire-service news & alert feed (automated ingestion)
- `/editor`: Editorial review queue (password-protected)
- `/updates`: Product updates timeline
- `/roadmap`: Roadmap + idea submissions
- `/privacy`: Privacy Policy
- `/terms`: Terms of Use
- `/support`: Support & FAQ

## News ingestion

A Convex cron (`convex/crons.ts`) polls approved RSS/Atom sources every 5
minutes, classifies items (category, town), dedupes, and publishes alerts
according to each source's trust level (1 = official, 2 = news org,
3 = contributor, 4 = public). Level 3–4 items are held for editorial review
at `/editor`; every automated and manual change is recorded in `auditLog`.

Setup:

1. Set `EDITOR_SECRET` (a long random string) in **three places** with the
   same value: `.env.local` / Vercel, the Convex dev deployment, and the
   Convex prod deployment (`npx convex env set EDITOR_SECRET ...`).
2. Also set `RESEND_API_KEY`, `ADMIN_EMAIL`, `RESEND_FROM_EMAIL`, and
   `SITE_URL` on the Convex deployment for review-queue digest emails
   (optional — emails are skipped when unset).
3. Seed starter sources: `npx convex run seedSources:seed`, then verify
   each URL (they're flagged `needsUrlVerification`) in the Convex
   dashboard.
4. Test a single source: `npx convex run ingest:pollSourceNow '{"sourceId":"..."}'`.
