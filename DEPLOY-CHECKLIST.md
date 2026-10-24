# Publish-today checklist

## Supabase
- [ ] Run `supabase/migrations/001_initial_schema.sql` in SQL Editor.
- [ ] Email provider enabled; email confirmation setting checked.
- [ ] Site URL set to the actual production URL.
- [ ] Local and production redirect URLs allow-listed.
- [ ] Signup and confirmation tested with an email you control.
- [ ] Mark your profile `is_founder = true` after signup.

## Cloudflare Pages
- [ ] Deploy from Git or upload the built `dist/` folder.
- [ ] Build command `npm run build`; output folder `dist`.
- [ ] Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as build environment variables.
- [ ] SPA route fallback `public/_redirects` is present in the repository.
- [ ] Check the website on mobile and desktop.

## Smoke test
- [ ] Home → Marketplace → Project detail navigation works.
- [ ] Signup sends a confirmation email.
- [ ] Login, forgot password, and reset password work.
- [ ] Creator profile saves and is publicly visible.
- [ ] New project appears in marketplace.
- [ ] Likes, saved projects, creator follows, comments, and sign-out work.
- [ ] The public profile can print/save as a PDF.

Do not announce as production-ready until account creation and database operations have been tested on the deployed domain.
