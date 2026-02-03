# Memory Note — petanque-dkg-web — 2026-02-03

## Summary
- Added Stripe Billing Portal route and Manage Subscription UI for apps/library.
- Added ManageSubscriptionButton client component and i18n labels.

## Files changed
- app/api/stripe/portal/route.ts
- components/ManageSubscriptionButton.tsx
- app/[locale]/apps/page.tsx
- app/[locale]/library/page.tsx
- src/i18n/messages/en.json
- src/i18n/messages/sv.json
- src/i18n/messages/fr.json
- src/i18n/messages/es.json
- src/i18n/messages/de.json
- src/i18n/messages/nl.json
- src/i18n/messages/th.json
- src/i18n/messages/da.json
- src/i18n/messages/it.json

## How to roll back
- `git revert <commit-hash>`
- Or redeploy previous Vercel deployment.

## Commands used
- `git status --short`
