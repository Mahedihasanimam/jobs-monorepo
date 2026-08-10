-- Structured eligibility, Diploma filtering, and source-linked question resources.
-- Run in the Supabase SQL editor before deploying the matching scraper/app.

ALTER TABLE jobs
    ADD COLUMN IF NOT EXISTS eligibility_summary text,
    ADD COLUMN IF NOT EXISTS eligible_applicants text,
    ADD COLUMN IF NOT EXISTS qualification_tags text[] NOT NULL DEFAULT '{}';

UPDATE jobs
SET qualification_tags = array_append(qualification_tags, 'diploma')
WHERE NOT qualification_tags @> ARRAY['diploma']::text[]
  AND lower(concat_ws(' ', title, education, description)) ~ '(diploma|ডিপ্লোমা|ডিপ্লোমাধারী)';

UPDATE jobs
SET eligibility_summary = nullif(concat_ws(E'\n', education, experience, age_requirement), '')
WHERE eligibility_summary IS NULL;

UPDATE jobs
SET eligible_applicants = 'অফিসিয়াল বিজ্ঞপ্তিতে উল্লেখিত শিক্ষা, অভিজ্ঞতা ও বয়সের শর্ত পূরণকারী প্রার্থীরা আবেদন করতে পারবেন।'
WHERE eligible_applicants IS NULL AND eligibility_summary IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_jobs_qualification_tags ON jobs USING gin (qualification_tags);
