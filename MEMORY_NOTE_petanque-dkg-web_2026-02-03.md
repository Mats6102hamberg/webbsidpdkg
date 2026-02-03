# MEMORY NOTE - petanque-dkg-web - 2026-02-03

## Summary
- Uppgraderade Next.js till 15.5.11 och uppdaterade lockfil.
- Lade till root-redirect `/` -> `/sv`.
- La till i18n-skelett med `supportedLocales.ts` och uppdaterade README.
- Korde `npm audit fix` utan `--force` (moderat svarbarhet kvar i Next.js).

## Files
- `/Users/admin/Projects/Webbsidan for min pdkg/petanque-dkg-web/app/page.tsx`
- `/Users/admin/Projects/Webbsidan for min pdkg/petanque-dkg-web/src/i18n/supportedLocales.ts`
- `/Users/admin/Projects/Webbsidan for min pdkg/petanque-dkg-web/README.md`
- `/Users/admin/Projects/Webbsidan for min pdkg/petanque-dkg-web/package.json`
- `/Users/admin/Projects/Webbsidan for min pdkg/petanque-dkg-web/package-lock.json`

## Restore
- `git checkout b3f681c`
- Vercel rollback till deployment byggd fran commit `b3f681c`

## Commands
- `npm view next@15 version`
- `npm install next@15.5.11`
- `npm audit fix`
