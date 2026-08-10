-- Run once in the Supabase SQL editor for an existing installation.
ALTER TABLE jobs
    ADD COLUMN IF NOT EXISTS organization_logo_url text,
    ADD COLUMN IF NOT EXISTS is_government_source boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_jobs_is_government_source
    ON jobs(is_government_source);

COMMENT ON COLUMN jobs.organization_logo_url IS 'Official organization logo URL collected from the source website';
COMMENT ON COLUMN jobs.is_government_source IS 'True only when the scraper source is an official government domain';

-- Backfill only known official Bangladesh government sources. Review before extending.
UPDATE jobs
SET is_government_source = true
WHERE lower(source_url) ~ '^https?://([^/]+\.)?gov\.bd(/|$)'
   OR lower(source_url) ~ '^https?://([^/]+\.)?teletalk\.com\.bd(/|$)';
