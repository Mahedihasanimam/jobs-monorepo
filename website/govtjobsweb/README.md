# বিডি সরকারি চাকরি — Bangladesh Government Jobs Aggregator

A fast, SEO-first Next.js (App Router + TypeScript) website for a Bangladesh
government jobs aggregator. Server-rendered/static wherever possible, built
for Google Search Console and organic growth from day one.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

```bash
npm run build && npm run start   # production build
```

## Project structure

```
src/
  app/                     Routes (App Router)
    page.tsx               Home
    jobs/page.tsx           Listing (?q, ?category, ?location, ?education, ?type, ?sort, ?page)
    jobs/[slug]/page.tsx     Job detail + JobPosting JSON-LD
    categories/page.tsx      Category index
    categories/[slug]/page.tsx  Category landing page (unique copy per category)
    latest-jobs/page.tsx
    closing-soon/page.tsx
    exam-notices/page.tsx
    exam-notices/[slug]/page.tsx
    about/ contact/ faq/ privacy-policy/ terms/
    sitemap.ts              Generates /sitemap.xml
    robots.ts               Generates /robots.txt
    layout.tsx               Root layout, fonts, global metadata, WebSite JSON-LD
  components/               Reusable UI (Header, Footer, JobCard, FilterBar, FaqAccordion, ...)
  lib/
    types.ts                 Job / Category / ExamNotice types
    data.ts                   SEED DATA — replace with your real feed (see below)
    utils.ts                  Date formatting, "closing soon" / "expired" helpers
```

## Connecting real data

Everything reads through the functions at the bottom of `src/lib/data.ts`
(`getLatestJobs`, `getClosingSoonJobs`, `getJobBySlug`, `getJobsByCategory`,
etc.). To go live with your existing app's data:

1. Replace the `jobs`, `categories`, and `examNotices` arrays (or the
   functions themselves) with calls to your existing API/database.
2. Keep the same return shapes (`Job`, `Category`, `ExamNotice` in
   `src/lib/types.ts`) and every page keeps working unchanged.
3. If your data source is dynamic/frequent, consider adding
   `export const revalidate = 300` (ISR) to the relevant page files instead
   of full static generation.

## SEO checklist already wired up

- Unique `title` + `description` per page via the App Router `metadata` API
- Open Graph + Twitter card metadata (site-wide + per job)
- `canonical` URLs on every page; filtered `/jobs` variants canonicalize to
  the base listing URL
- JSON-LD: `WebSite`+`SearchAction` (layout), `JobPosting` (job detail),
  `BreadcrumbList` (breadcrumbs), `FAQPage` (every FAQ accordion)
- `sitemap.xml` and `robots.txt` generated from live data
  (`src/app/sitemap.ts`, `src/app/robots.ts`)
- Semantic HTML, one `<h1>` per page, descriptive slugs, internal linking
  between home → categories → listings → job detail
- No client-side rendering for content: search and filters are plain
  `<form method="GET">`, fully crawlable and JS-optional

## Before launch

- Update `SITE_URL` (currently `https://bdsorkarichakri.com`) in
  `layout.tsx`, `sitemap.ts`, `robots.ts`, and `Breadcrumbs.tsx` to your
  real domain.
- Swap seed data in `lib/data.ts` for your live feed.
- Add real Open Graph images (`/public/og-image.png`, referenced via
  `metadata.openGraph.images` once added).
- Submit `sitemap.xml` in Google Search Console.
- Wire the `/contact` form to an email or forms API (it's currently a
  static demo form, intentionally not calling any backend).
