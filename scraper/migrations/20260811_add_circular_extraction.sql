-- Structured circular extraction with auditability and OCR provenance.
ALTER TABLE jobs
    ADD COLUMN IF NOT EXISTS subject text,
    ADD COLUMN IF NOT EXISTS gender_requirement text,
    ADD COLUMN IF NOT EXISTS quota_requirement text,
    ADD COLUMN IF NOT EXISTS application_fee text,
    ADD COLUMN IF NOT EXISTS freshers_allowed boolean,
    ADD COLUMN IF NOT EXISTS circular_text text,
    ADD COLUMN IF NOT EXISTS circular_document_hash text,
    ADD COLUMN IF NOT EXISTS circular_extraction_method text,
    ADD COLUMN IF NOT EXISTS circular_processing_status text,
    ADD COLUMN IF NOT EXISTS requirement_confidence jsonb NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS requirement_sources jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_jobs_circular_processing_status ON jobs(circular_processing_status);
CREATE INDEX IF NOT EXISTS idx_jobs_freshers_allowed ON jobs(freshers_allowed);
