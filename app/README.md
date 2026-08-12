# Govt Jobs BD

A Bangla-first Bangladesh government-jobs aggregator built with React Native and Expo SDK 54. It reads normalized circulars directly from the Supabase `jobs` table and always exposes the official source. This is an independent aggregator, not an official Bangladesh Government application.

## Features

- Latest, closing-soon, searchable, filtered, and paginated job feeds
- Exact live statistics from Supabase—no fabricated counts
- Full job details with official source, application timeline, embedded circular preview, and PDF download
- Exam schedules, admit cards, and results from the Supabase `exam_notices` table
- Local bookmarks with Zustand and AsyncStorage; no account required
- Native job sharing, friendly errors, empty states, pull-to-refresh, and skeletons
- Persisted TanStack Query cache and an offline indicator
- Bangla date formatting and an i18n-ready `locales` structure
- Notification permission/token architecture without requesting permission on launch

## Prerequisites

- Node.js 20 or newer
- npm 10+ (pnpm also works if this monorepo adopts it)
- Expo Go compatible with SDK 54, or an Android/iOS development build
- Android Studio for an Android emulator and Xcode on macOS for iOS Simulator
- A Supabase project with the `jobs` table and read access for the anonymous role

## Install and configure

```bash
cd app
npm install
cp .env.example .env
```

Fill in `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Only the public anonymous key belongs in the app. Never add `SUPABASE_SERVICE_ROLE_KEY`; it must stay in the scraper/backend. `.env` is ignored by Git.

The mobile client in `lib/supabase.ts` validates configuration and uses AsyncStorage only for the optional Supabase auth session. No service role is referenced. Configure Row Level Security so `anon` can select public job rows, for example with a read-only policy appropriate to your project.

## Run

```bash
npm start
npm run android
npm run ios
npm run web
```

You can also run `npx expo start`. Scan the QR code with Expo Go or press `a`/`i` for an emulator/simulator.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run check
npx expo-doctor
```

## Production builds with EAS

Install and authenticate the EAS CLI, connect the project, then build:

```bash
npm install --global eas-cli
eas login
eas init
eas build --profile preview --platform android
eas build --profile production --platform all
```

Before production, replace the placeholder values in `app.json`:

- `expo.name` and `expo.slug`
- `ios.bundleIdentifier` (`com.mehedi.govtjobsbd`)
- `android.package` (`com.mehedi.govtjobsbd`)
- icons and splash artwork in `assets/images`
- EAS project ID after `eas init`

Package identifiers cannot be changed after store release without creating a new listing.

## Project structure

```text
app/                    Expo Router routes
  (tabs)/               Home, Jobs, Notices, Saved
  job/[id].tsx          Job details
  filters.tsx           Modal filters
components/
  home/ job/ layout/    Domain components
  providers/ ui/        Providers and reusable primitives
constants/              Colors and layout tokens
hooks/                  React Query and UI hooks
lib/                    Supabase and Query clients
locales/                Bangla and English dictionaries
services/               Supabase queries and notifications adapter
store/                  Zustand stores
types/                   Database/domain types
utils/                   Dates, URLs, and sharing helpers
```

## How job queries work

All database access lives in `services/jobs.service.ts`; UI components contain no Supabase queries.

- Main feed: `is_active = true`, excludes past deadlines, 20 rows per page
- Latest: orders by `published_date` descending, then `created_at` as the null fallback
- Closing soon: today through seven days from today, ordered by deadline
- Search: server-side `ilike` across title, organization, category, and location
- Filters: organization, category, location, employment type, deadline, and publish window
- Details: a single row by numeric ID
- Diploma filter: server-side `qualification_tags @> ARRAY['diploma']`
- Previous questions: source-linked resources from `previous_questions`, matched by `job_id`
- Facets: distinct values are derived from up to 1,000 active rows. For very large datasets, replace this with Supabase views/RPCs returning distinct values.

Recommended indexes include `is_active`, `published_date`, `deadline`, and trigram indexes for fields searched with `ilike`. RLS must permit anonymous read access while keeping insert/update/delete restricted to the backend.

Before using eligibility, Diploma filtering, or previous questions against an existing database, run `scraper/migrations/20260810_add_eligibility_and_questions.sql` in the Supabase SQL Editor. Configure the scraper's `QUESTION_ARCHIVE_URLS` and/or `BRAVE_SEARCH_API_KEY`; see `scraper/README.md` for the matching and source-safety behavior.

## Bookmarks and offline behavior

`store/savedJobs.store.ts` persists only `savedJobIds: number[]` through Zustand and AsyncStorage. Saved jobs are fetched by IDs and remain visible when expired, with an expired badge. Query responses are persisted for 24 hours, so recent data remains available during temporary network loss. AsyncStorage contains no application secrets.

## Add a screen

Create a route under `app/`, then navigate using Expo Router:

```tsx
router.push('/your-route');
```

Add tab routes to `app/(tabs)/_layout.tsx`. Put data access in `services`, query wrappers in `hooks`, and reusable visuals in `components`.

## Branding and localization

- Change brand colors in `constants/colors.ts`; spacing/radii live in `constants/layout.ts`.
- Change the visible name and identifiers in `app.json` and the app label in `app/(tabs)/more.tsx`.
- Translation dictionaries live in `locales/bn.ts` and `locales/en.ts`. The structure is ready for a locale store/provider when language switching is enabled.
- Brand masters live in `assets/brand`; platform-ready icon, splash, adaptive, monochrome, notification, and favicon files live in `assets/images`.

## Production checklist

1. Set real Supabase public environment values in EAS environment/secrets.
2. Confirm RLS grants only the required anonymous `SELECT` access.
3. Replace name, package IDs, icons, splash, notification icon, privacy/contact links.
4. Test real job rows, null fields, invalid URLs, PDFs, filters, pagination, and bookmark hydration.
5. Test small Android devices, iPhones, font scaling, screen readers, dark system bars, and poor networks.
6. Add a real privacy policy and support contact.
7. Configure an EAS project ID before enabling push token registration.
8. Run `npm run check`, `npx expo-doctor`, preview builds, and store review builds.

## Disclaimer

চাকরির তথ্য সংশ্লিষ্ট সরকারি প্রতিষ্ঠানের প্রকাশিত তথ্য থেকে সংগ্রহ করা হয়। আবেদন করার আগে অফিসিয়াল বিজ্ঞপ্তি যাচাই করুন। This app aggregates publicly available government job information from official sources. It is not an official government application.
