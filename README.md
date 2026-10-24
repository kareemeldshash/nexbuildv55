# Forge — Engineering marketplace

Forge is a responsive place for engineering students, makers, and engineers to publish projects, find collaborators, and turn real work into a living CV.

## Included

- Email and password sign-up/sign-in with Supabase email confirmation and password reset.
- Public engineer profiles with headline, bio, skills, university, and external links.
- Publish, edit, and delete projects with discipline, project status, demo link, and repository link.
- Search and category filtering across the marketplace.
- Project likes, private bookmarks, and an activity leaderboard.
- Mobile-first responsive interface, dark graphite surfaces, teal accents, and colorful project art.
- Print-ready public profile view using the browser's Save as PDF function.
- Supabase Row Level Security policies for account-owned data and Cloudflare Pages SPA routing.

## Supabase setup

1. Open the Supabase project with reference bwctasiftanzitpxjhqe.
2. Open SQL Editor and execute the complete file at supabase/schema.sql.
3. In Authentication → Providers → Email, enable password sign-in and email confirmation.
4. In Authentication → URL Configuration, set the Site URL to your live domain, then add http://localhost:5173/** and https://YOUR-SITE.pages.dev/** as redirect URLs.
5. Configure the Vite variables below locally and as Cloudflare Pages environment variables.

VITE_SUPABASE_URL = https://bwctasiftanzitpxjhqe.supabase.co
VITE_SUPABASE_ANON_KEY = the public anon key supplied for this project

Only the anon/public key belongs in browser code. Never add a service-role key, database password, or Cloudflare API token to this repository.

Supabase's default email sender is rate-limited, so it is suitable for initial testing but may need custom SMTP for a public launch.

## Run locally

Install Node.js 20 or later. Copy .env.example to .env.local, set the Supabase values, then run npm install and npm run dev. Open the local URL shown by Vite.

## Cloudflare Pages

Connect the repository to Cloudflare Pages. Select the Vite framework preset, use npm run build as the build command, and dist as the output directory. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY under Settings → Environment variables for Production (and Preview if wanted). Redeploy after changing variables.

The included public/_redirects file sends refreshed client-side routes to the React entry point.

## Before a public launch

Run npm run build. Test registration, email confirmation, login, project publishing, likes, bookmarks, and password reset from the production domain. Apply schema.sql before using the live Supabase integration. Demo cards are labeled as examples and are not database records; remove or replace them as real projects are published.

Activity scores are signals of participation, not proof of engineering ability. Email delivery follows Supabase Auth configuration and rate limits.