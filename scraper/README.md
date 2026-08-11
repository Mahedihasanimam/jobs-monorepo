# Bangladesh Government Job Scraper

A robust, production-ready Python web scraper that collects Bangladesh government job circulars from official sources and upserts them into a Supabase PostgreSQL database. It is designed to run automatically via GitHub Actions and requires no continuous backend server.

## Features

- **Multi-Source**: Scrapes BPSC, Teletalk, Railway, Health (DGHS), Education (SHED) and other generic National Web Portal sites.
- **Smart Parsing**: Automatically cleans HTML, normalizes spaces, and preserves Bengali unicode text.
- **Date Conversion**: Converts Bengali dates and digits into standard `YYYY-MM-DD` ISO formats.
- **Deduplication**: Generates deterministic fingerprints based on organization, title, and deadline to prevent duplicate jobs in Supabase.
- **Resilience**: Implements timeouts, retries with exponential backoff (using `tenacity`), and graceful error handling.
- **CI/CD Ready**: Runs automatically on a schedule using GitHub Actions.

## Setup Instructions

### 1. Clone & Environment

```bash
git clone <your-repo-url>
cd bangladesh-govt-job-scraper

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

Circular PDFs are processed automatically. Embedded PDF text is preferred; scanned pages use local Tesseract OCR. Install the Bengali language data on the scraper host:

```bash
brew install tesseract-lang      # macOS
# Debian/Ubuntu: apt install tesseract-ocr-ben
tesseract --list-langs           # must include ben and eng
```

Apply `migrations/20260811_add_circular_extraction.sql` before the first enriched upsert. Use `--skip-pdf` to temporarily disable PDF work, and `PDF_PROCESSING_CONCURRENCY=2` to control CPU/network usage. Extracted values include confidence and page/excerpt provenance; the original circular remains the final authority.

### 2. Configure Supabase

1. Go to [Supabase](https://supabase.com) and create a new project.
2. For a new database, run `setup.sql`. For an existing database, run only `migrations/20260810_release_schema.sql`. The release migration is idempotent and adds organization identity, categories, and exam/admit-card notices.
3. Go to **Project Settings > API** to find your credentials.
4. Copy the `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
5. Update `.env` with your URLs and Keys:
   ```env
   SUPABASE_URL=your_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
   > **Warning:** NEVER expose the `SUPABASE_SERVICE_ROLE_KEY` to your mobile frontend app. Use it ONLY in this backend scraper (local `.env` and GitHub Secrets). Your mobile app should use the Anon/Public key.

### 3. Run Locally

Run the orchestrator to scrape all sources:
```bash
python main.py
```

Run a specific source:
```bash
python main.py --source bpsc teletalk
```

Run in dry-run mode (fetches and parses, but does NOT write to the database):
```bash
python main.py --dry-run
```

## Running Tests

Tests use `pytest` and do not make actual network calls.

```bash
python -m pytest tests/
```

## GitHub Actions Deployment

The scraper is configured to run automatically every day at ~7:00 AM Bangladesh Time using GitHub Actions.

1. Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**.
2. Click **New repository secret**.
3. Add `SUPABASE_URL` with your project URL.
4. Add `SUPABASE_SERVICE_ROLE_KEY` with your service role key.
5. The scraper will now run automatically. You can also trigger it manually from the **Actions** tab in GitHub.

## Adding a New Source

Most Bangladesh Government websites use the National Web Portal template. You can easily add them using the `GenericGovScraper`.

1. Create a new scraper in `scrapers/your_source.py`:
   ```python
   from scrapers.generic_gov import GenericGovScraper
   
   class YourSourceScraper(GenericGovScraper):
       def __init__(self):
           super().__init__({
               "name": "Your Source",
               "base_url": "https://example.gov.bd",
               "listing_url": "https://example.gov.bd/site/view/notices",
               "organization": "Your Org Name"
           })
   ```
2. Register it in `main.py` inside `SCRAPER_REGISTRY`.

If a site does not use the standard template, inherit from `BaseScraper` and implement the `scrape()` and `parse_job()` methods directly (see `TeletalkScraper` for an example).
# Eligibility and previous-question resources

Jobs now derive `eligibility_summary`, `eligible_applicants`, and `qualification_tags`. Diploma-compatible circulars are tagged with `diploma` from the title, education, or description and can be filtered directly by the app.

Previous questions are stored as source-linked metadata; files are not copied. Configure comma-separated, permission-appropriate archive pages:

```env
QUESTION_ARCHIVE_URLS=https://official.example.gov.bd/questions,https://trusted-publisher.example/questions
```

The discovery scraper only follows question-labelled links on these configured pages and matches them to scraped job organization/title tokens. Government domains are marked official; other resources are visibly labelled as third-party in the app. Run `migrations/20260810_add_eligibility_and_questions.sql` before enabling this feature.

For job-specific web discovery when archive pages are incomplete, optionally configure Brave Search API. Search is capped per scraper run to control cost and rate limits:

```env
BRAVE_SEARCH_API_KEY=your_api_key
QUESTION_SEARCH_MAX_JOBS=25
```

Results are accepted only when their title/description/URL explicitly identifies a previous question or question paper. The app links to the publisher; it does not copy the file.
