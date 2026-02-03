# MEMORY NOTE - petanque-dkg-web - 2026-02-03

## Summary
- Implementerade Stripe Checkout Phase 1 med API route och success/cancel-sidor.
- Lade till aktivt "Buy digital bundle" CTA pa produktsidan.
- Uppdaterade i18n med checkout-texter och buyBundle.

## Files
- `/Users/admin/Projects/Webbsidan for min pdkg/petanque-dkg-web/app/api/stripe/checkout/route.ts`
- `/Users/admin/Projects/Webbsidan for min pdkg/petanque-dkg-web/app/[locale]/checkout/success/page.tsx`
- `/Users/admin/Projects/Webbsidan for min pdkg/petanque-dkg-web/app/[locale]/checkout/cancel/page.tsx`
- `/Users/admin/Projects/Webbsidan for min pdkg/petanque-dkg-web/components/BuyBundleButton.tsx`
- `/Users/admin/Projects/Webbsidan for min pdkg/petanque-dkg-web/app/[locale]/books/[slug]/page.tsx`
- `/Users/admin/Projects/Webbsidan for min pdkg/petanque-dkg-web/src/i18n/messages/*.json`
- `/Users/admin/Projects/Webbsidan for min pdkg/petanque-dkg-web/package.json`
- `/Users/admin/Projects/Webbsidan for min pdkg/petanque-dkg-web/package-lock.json`

## Restore
- `git checkout 79726e4`
- Vercel rollback till deployment byggd fran commit `79726e4`

## Commands
- `npm install stripe`
