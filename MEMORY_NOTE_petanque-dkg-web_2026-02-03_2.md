# MEMORY NOTE - petanque-dkg-web - 2026-02-03

## Summary
- Lade till outputFileTracingRoot i next.config.
- Implementerade i18n messages + translator.
- Implementerade Book Vault local/remote lasning och produkt/coming-soon-sidor.

## Files
- `/Users/admin/Projects/Webbsidan for min pdkg/petanque-dkg-web/next.config.js`
- `/Users/admin/Projects/Webbsidan for min pdkg/petanque-dkg-web/app/[locale]/page.tsx`
- `/Users/admin/Projects/Webbsidan for min pdkg/petanque-dkg-web/app/[locale]/coming-soon/page.tsx`
- `/Users/admin/Projects/Webbsidan for min pdkg/petanque-dkg-web/app/[locale]/books/[slug]/page.tsx`
- `/Users/admin/Projects/Webbsidan for min pdkg/petanque-dkg-web/components/LanguageSwitcher.tsx`
- `/Users/admin/Projects/Webbsidan for min pdkg/petanque-dkg-web/src/i18n/supportedLocales.ts`
- `/Users/admin/Projects/Webbsidan for min pdkg/petanque-dkg-web/src/i18n/getMessages.ts`
- `/Users/admin/Projects/Webbsidan for min pdkg/petanque-dkg-web/src/i18n/t.ts`
- `/Users/admin/Projects/Webbsidan for min pdkg/petanque-dkg-web/src/i18n/messages/*.json`
- `/Users/admin/Projects/Webbsidan for min pdkg/petanque-dkg-web/src/bookVault/bookVault.ts`

## Restore
- `git checkout 0dece5e`
- Vercel rollback till deployment byggd fran commit `0dece5e`

## Commands
- `npm install next@15.5.11`
- `npm audit fix`
