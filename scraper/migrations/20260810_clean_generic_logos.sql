-- Remove shared government emblems incorrectly collected as organization logos.
-- The next scraper run will replace these with source-organization logos where available.
UPDATE jobs
SET organization_logo_url = NULL
WHERE lower(coalesce(organization_logo_url, '')) SIMILAR TO
      '%(bangladesh-government-logo|bangladesh-govt-logo|govt-logo|government-logo|national-portal|emblem)%';
