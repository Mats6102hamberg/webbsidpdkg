# MEMORY NOTE - petanque-dkg-web - 2026-02-03

## Summary
- Lade till Stripe webhook som skapar entitlements vid checkout.session.completed.
- Implementerade magic link auth (request + verify) med session cookie.
- Lade till /login och /library sidor och i18n-texter.
- Lagt schema for users, login_tokens och entitlements.

## Files
- `/Users/admin/Projects/Webbsidan for min pdkg/petanque-dkg-web/app/api/stripe/webhook/route.ts`
- `/Users/admin/Projects/Webbsidan for min pdkg/petanque-dkg-web/app/api/auth/request-link/route.ts`
- `/Users/admin/Projects/Webbsidan for min pdkg/petanque-dkg-web/app/api/auth/verify/route.ts`
- `/Users/admin/Projects/Webbsidan for min pdkg/petanque-dkg-web/app/[locale]/login/page.tsx`
- `/Users/admin/Projects/Webbsidan for min pdkg/petanque-dkg-web/app/[locale]/library/page.tsx`
- `/Users/admin/Projects/Webbsidan for min pdkg/petanque-dkg-web/components/LoginForm.tsx`
- `/Users/admin/Projects/Webbsidan for min pdkg/petanque-dkg-web/src/auth/*`
- `/Users/admin/Projects/Webbsidan for min pdkg/petanque-dkg-web/src/db/db.ts`
- `/Users/admin/Projects/Webbsidan for min pdkg/petanque-dkg-web/db/schema.sql`

## Restore
- `git checkout 6ca7939`
- Vercel rollback till deployment byggd fran commit `6ca7939`

## Commands
- `npm install @vercel/postgres`
