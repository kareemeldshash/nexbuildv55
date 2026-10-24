# EngiHub – Engineering Projects Marketplace

A modern, colorful, mobile-first marketplace where engineers showcase projects, collaborate, and climb activity rankings. Profiles act as living CVs.

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- **UI**: Custom components + Lucide icons + Framer Motion ready
- **Backend / Auth / DB**: Supabase (Auth, Postgres, Storage, Realtime)
- **Hosting**: Cloudflare Pages (recommended) or Vercel

## Features Included

- Email + password auth with verification
- Beautiful responsive design (phone + desktop)
- Activity score + leaderboard system
- Project marketplace with filters
- Public profiles (living CV)
- Dashboard for creators
- Create / list projects
- Skill tags, tech stack, categories
- Dark, vibrant theme with cyan / purple / emerald accents

## Quick Start

### 1. Install dependencies

```bash
cd engihub
npm install
```

If some packages are missing:

```bash
npm install @supabase/supabase-js @supabase/ssr framer-motion lucide-react clsx tailwind-merge date-fns
```

### 2. Create Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. Copy **Project URL** and **anon public** key
3. In SQL Editor, paste and run the entire content of `supabase/schema.sql`
4. (Optional) Create Storage buckets: `avatars` and `project-images` (public)

### 3. Environment variables

```bash
cp .env.example .env.local
```

Fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=EngiHub
```

### 4. Auth settings in Supabase

- Authentication → Providers → Email: enable
- Confirm email: ON (recommended)
- Site URL: `http://localhost:3000` (and later your production domain)
- Redirect URLs: add `http://localhost:3000/**` and your production domain

### 5. Run locally

```bash
npm run dev
```

Open http://localhost:3000

## Deploy to Cloudflare Pages

1. Push code to GitHub
2. Cloudflare Dashboard → Pages → Create project → Connect repo
3. Build command: `npm run build`
4. Output directory: `.next` (or follow Cloudflare Next.js guide)
5. Add the same environment variables in Cloudflare

Alternatively use Vercel (one-click).

## Project Structure

```
src/
├── app/
│   ├── (auth)/login & signup
│   ├── dashboard/
│   ├── projects/          # list + new + [slug]
│   ├── leaderboard/
│   ├── u/[username]/     # public profile
│   ├── layout.tsx
│   └── page.tsx           # homepage
├── components/
│   ├── layout/            # Navbar, Footer
│   ├── ui/                # Button, Input
│   └── ...
├── lib/
│   ├── supabase/          # client + server helpers
│   └── utils.ts
└── middleware.ts          # auth protection
```

## Activity Scoring (already in schema)

| Action                    | Points |
|---------------------------|--------|
| Create project            | +50    |
| Update project            | +10    |
| Collaboration accepted    | +30    |
| High review received      | +25    |
| Skill endorsement         | +15    |
| Daily login               | +5     |

Only last 90 days count. Leaderboard sorts by `activity_score`.

## Next Features You Can Add

- Project detail page with comments & likes
- Real-time notifications
- Image upload to Supabase Storage
- PDF resume export
- Follow system
- Weekly challenges
- Framer Motion animations on cards
- Edit profile form

## Support

Continue chatting — I can generate any missing page, the project detail view, image upload, or polish the UI further.

Built for engineers who want their work to be seen.
