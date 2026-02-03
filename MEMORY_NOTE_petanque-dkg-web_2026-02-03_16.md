# Memory Note — petanque-dkg-web — 2026-02-03

## Summary
- Added Stripe subscription checkout for Boule Apps and a new Apps page.
- Extended webhook to store/update app_access entitlements and subscription status with normalized status mapping.
- Added app access status section in Library.
- Updated DB schema for app_access, subscription id, and status.
- Added i18n strings for Apps + Library app access section.

## Files changed
- app/api/stripe/subscription/checkout/route.ts
- app/api/stripe/webhook/route.ts
- app/[locale]/apps/page.tsx
- app/[locale]/library/page.tsx
- components/StartSubscriptionButton.tsx
- db/schema.sql
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
