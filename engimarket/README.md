# EngiMarket

A responsive engineering creator marketplace starter built with React, Vite, Supabase Auth/Database, and Cloudflare Pages. It uses the **graphite + orange** visual direction selected for the project.

## What is included

- Responsive homepage that puts the founder/creator profile first
- Marketplace search, category filters, sorting, source-code filter, and project detail pages
- Creator directory and public creator profile pages
- Email/password sign up and sign in, email confirmation, forgotten-password and reset-password pages
- Creator workspace for editing a public CV-style profile and publishing projects
- Likes/appreciations, saved projects, creator follows, and public project comments
- Profile image URL support and a print-friendly public CV page that can be saved as PDF from the browser
- Supabase schema, account-creation trigger, indexes, and Row Level Security policies
- Demo project cards so the design doesn't look empty before you publish real work (they are labeled as examples)
- Cloudflare Pages SPA redirect rule

## 1. Run it locally

You need Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

`.env.local` is prefilled with the Supabase project URL and the **public anon key** you supplied. The anon key is intended for browser apps, but security depends on the database's RLS policies. Never put a Supabase `service_role` key, secret key, database password, or Cloudflare API token in frontend code or in `.env.local`.

For a different Supabase project, copy `.env.example` to `.env.local` and set:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY
```

## 2. Set up Supabase (required for real accounts/data)

1. Open your Supabase project dashboard for `bwctasiftanzitpxjhqe`.
2. Go to **SQL Editor** and run the full file `supabase/migrations/001_initial_schema.sql`.
3. Go to **Authentication → Providers → Email**. Enable email/password sign-in and turn on email confirmation if it is not already enabled.
4. In **Authentication → URL Configuration**, set your Site URL to your deployed website URL. Add these redirect URLs:
   - `http://localhost:5173/**` for local testing
   - `https://YOUR-SITE.pages.dev/**` for Cloudflare Pages
   - Your custom domain wildcard, if you use one
5. Test signing up with an email you can access. The confirmation link should return you to `/dashboard`.

### Email delivery note

Supabase's built-in test mail service has a strict low rate limit and is best-effort. It is okay for initial testing, but you may need a custom SMTP provider for reliable public signups. There is no Google OAuth requirement or paid Google account needed for this app.

### Mark your own profile as the founder

After you sign up and verify your email, open **Table Editor → profiles**, find your row, and set `is_founder` to `true`. Or run this in SQL Editor after replacing the username:

```sql
update public.profiles set is_founder = true where username = 'your-username';
```

Do not run that command with another user's username.

## 3. Deploy on Cloudflare Pages

### Fast path using a Git repository

1. Put this folder in a new GitHub repository (do not commit `.env.local`; it is ignored by `.gitignore`).
2. In the Cloudflare dashboard, go to **Workers & Pages → Create → Pages → Connect to Git** and import the repository.
3. Use these build settings:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
4. In the Pages project's **Settings → Environment variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for Production (and Preview if you want preview deployments to use Supabase).
5. Deploy. Add the resulting `pages.dev` URL to Supabase Auth's allowed redirect URLs, then test signup, email confirmation, login, create project, comment, and sign out.

The included `public/_redirects` file sends client-side routes back to `index.html` so `/marketplace`, `/profile/...`, and other React routes work when refreshed.

### Direct upload

Cloudflare Pages' direct upload expects built static assets. Run `npm install` and `npm run build`, then upload the contents of the `dist` folder through the Pages dashboard. If the dashboard only offers Git integration in your account's current workflow, use the Git path above.

## 4. Before announcing the site publicly

- Confirm email verification links work from the production hostname.
- Keep the RLS policies enabled; do not expose a service-role/secret key.
- Change your profile name, username, bio, skills, and social links.
- Replace the example project cards by publishing your real work. Demo projects are clearly marked and are not database records.
- Add a custom SMTP provider if the default Supabase email service becomes too limited.
- Review image licenses/ownership before adding project media. The current showcase images are remote Unsplash image URLs and need a network connection.

## Build check

Run `npm run build`. The output is written to `dist/` and can be hosted on Cloudflare Pages.
