# SESSION SUMMARY

## Oversikt av vad som implementerades
- Lade till outputFileTracingRoot for att undvika workspace-root-varning.
- Byggde i18n-struktur med messages, getMessages och enkel translator.
- Implementerade Book Vault-integration med lokal og remote mode.
- Skapade sidor for home, produkt og coming soon med locale-baserad routing.
- Lade till LanguageSwitcher som behaller aktuell path vid sprakkifte.
- Polish: svenska strangar, robust LanguageSwitcher, format-fallback, og Topbar-komponent.
- UX: visade upplaga pa produktsidan og lade A5-coming-soon microcopy.
- Stripe Phase 1: checkout API, success/cancel-sidor, og aktiv CTA for digitalt paket.
- Stripe hardening: async headers-origin, referer fallback, apiVersion, og try/catch.
- Dev logging for Stripe errors i checkout.
- Stripe API svarar med stabila felkoder.
- Stripe Phase 2: webhook-driven entitlements, magic link auth, og enkel Library sida.
- Auth polish: invalid link-sida, logout, og product_type constraint.
- Reader MVP: skyddad reader-sida og säker PDF-leverans via API.
- Reader polish: loading overlay, open-in-new-tab, og dev-logging for saknad asset.
- E-book delivery: skyddad ebook via secure file route, bibliotekslankar och "du ager"-sektion.
- UX polish: library CTA, format-badge, reader e-bokslänk.
- UX polish: go-to-library button och reader e-bok download.
- Stripe subscription: checkout for Boule Apps, apps-sida, och app_access-entitlements via webhook.
- Stripe subscription: status-normalisering for app_access samt library-sektion for app-åtkomst.
- Fix: Apps-sida typning uppdaterad for Next 15 PageProps (params/searchParams som Promise).
- Fix: Apps-sida typning uppdaterad till minimal Next 15 checklista (params som Promise).
- Fix: Auth verify-sida typning uppdaterad för Next 15 PageProps (params/searchParams som Promise).
- UI: Ombyggd startsida med hero, värdekort och bokkort samt ny SiteHeader/Container.
- UI: Polerat bokkort på startsidan och uppdaterat Apps-sida till samma landing-stil.

## Nya filer och komponenter
- `app/[locale]/books/[slug]/page.tsx`
- `app/[locale]/coming-soon/page.tsx`
- `app/[locale]/checkout/success/page.tsx`
- `app/[locale]/checkout/cancel/page.tsx`
- `app/[locale]/login/page.tsx`
- `app/[locale]/library/page.tsx`
- `app/[locale]/auth/verify/page.tsx`
- `app/[locale]/reader/[slug]/page.tsx`
- `app/[locale]/apps/page.tsx`
- `app/api/stripe/checkout/route.ts`
- `app/api/stripe/subscription/checkout/route.ts`
- `app/api/stripe/webhook/route.ts`
- `app/api/auth/request-link/route.ts`
- `app/api/auth/verify/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/reader/file/route.ts`
- `components/LanguageSwitcher.tsx`
- `components/Topbar.tsx`
- `components/BuyBundleButton.tsx`
- `components/LoginForm.tsx`
- `components/LogoutButton.tsx`
- `components/ReaderFrame.tsx`
- `components/Container.tsx`
- `components/SiteHeader.tsx`
- `components/StartSubscriptionButton.tsx`
- `src/bookVault/bookVault.ts`
- `src/bookVault/assets.ts`
- `src/i18n/getMessages.ts`
- `src/i18n/t.ts`
- `src/i18n/messages/en.json`
- `src/i18n/messages/sv.json`
- `src/i18n/messages/fr.json`
- `src/i18n/messages/es.json`
- `src/i18n/messages/de.json`
- `src/i18n/messages/nl.json`
- `src/i18n/messages/th.json`
- `src/i18n/messages/da.json`
- `src/i18n/messages/it.json`
- `src/auth/origin.ts`
- `src/auth/session.ts`
- `src/auth/tokens.ts`
- `src/db/db.ts`
- `db/schema.sql`

## Hur systemet fungerar (user + admin)
- User: `/[locale]` visar startsida med locale-baserade texter og lank till bok.
- User: `/[locale]/books/[slug]` laser Book Vault meta og renderar produktdata samt aktivt Stripe CTA.
- User: `/[locale]/checkout/success` og `/[locale]/checkout/cancel` visar checkout-resultat.
- User: `/[locale]/login` visar magic link-formular.
- User: `/[locale]/library` visar entitlements for inloggad e-post.
- User: `/[locale]/auth/verify` visar felmeddelande for ogiltig/utgangen länk.
- User: `/[locale]/reader/[slug]` visar interaktiv PDF om entitlement finns.
- User: e-bok kan öppnas eller laddas ner via secure file route.
- Admin: Stripe webhook skriver entitlements vid checkout.session.completed.

## Tekniska losningar och beslut
- I18n laddas via dynamisk import av `messages/<locale>.json`.
- Fallback till `en` om locale eller bokmetadata saknas.
- Book Vault har local og remote mode styrt via env vars.
- Stripe Checkout skapas via API route som validerar slug/locale/format og hanterar fel.
- Startsidan hämtar Book Vault metadata för att visa titel/subtitel/upplaga i bokkort.
- Apps-sidan använder SiteHeader/Container med hero, CTA/statuspanel och värdekort.
- API svarar med stabil `code` for enklare UI-hantering.
- Magic link auth anvander login_tokens med hashade tokens og httpOnly session cookie.
- Reader API validerar session og entitlement innan PDF streamas/proxas.
- Ebook levereras via samma secure route med inline/attachment.
- Stripe subscription skapar Checkout Session i mode subscription for inloggade användare.
- Webhook hanterar app_access-entitlements och uppdaterar status vid subscription events.

## Environment variables
- `BOOK_VAULT_MODE` (local | remote, default local)
- `BOOK_VAULT_PATH` (lokal filsystemroot)
- `BOOK_VAULT_BASE_URL` (remote bas-URL)
- `DEFAULT_LOCALE` (dokumenterad som en, konst i kod)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_BUNDLE`
- `STRIPE_PRICE_ID_APP_SUB`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (valfri)
- `DATABASE_URL`
- `AUTH_SECRET`
- `APP_BASE_URL` (valfri)

## Nasta steg / TODO
- Om onskat: uppdatera texter i icke-engelska messagefiler.
- Om onskat: lagg till sample Book Vault data for lokalt test.
- Koppla Stripe webhook live i produktion.
- Skicka riktiga email med magic links.

## Vad som INTE gjordes (och varfor)
- Ingen webhook-processor for andra Stripe events.
- Ingen riktig e-postleverans (dev-only logg).

## Risker eller begransningar
- Webhook kravs for att skapa entitlements.
- Magic link skickas bara till console i dev.
- Reader kravar korrekt interactive.pdf pa Book Vault.
- Ebook kravar korrekt ebook.pdf pa Book Vault.

## Git commit-information
- `3371b02` (step 0.7: outputFileTracingRoot)
- `0dece5e` (i18n and book vault integration)
- `87d4931` (update session summary and memory note)
- `1766ec5` (chore: remove unused import)
- `360ec00` (update session summary)
- `c1e83d3` (polish: sv strings + switcher robustness + format fallback)
- `582dcbc` (ux: a5 coming soon note + show edition)
- `79726e4` (feat: stripe checkout phase 1)
- `5fe34ea` (fix: stripe checkout origin and error handling)
- `17795bc` (chore: log stripe checkout errors in dev)
- `e3ed659` (feat: add stripe error codes)
- `6ca7939` (feat: stripe webhook + magic link auth)
- `2e08f39` (polish: invalid magic link handling + logout + product_type constraint)
- `eb13f3c` (feat: protected reader + secure pdf delivery)
- `51a401c` (polish: reader loading + dev missing-asset logs + open in new tab)
- `7adf279` (feat: protected ebook delivery)
- `0e2d393` (ux: library CTA + format badge + reader ebook link)
- `d6346d2` (ux: library button CTA + reader ebook download)
- `490e428` (feat: app subscription checkout + webhook entitlements)
- `2d1a0c9` (fix: apps page PageProps typing)
- `ff864fd` (fix: apps page props minimal pattern)
- `9e0091e` (fix: verify page PageProps typing)
- `ea34bfc` (ui: home landing page redesign)
