-- Add is_saved and is_applied columns to job_subscriptions
ALTER TABLE job_subscriptions
ADD COLUMN IF NOT EXISTS is_saved boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_applied boolean DEFAULT false;
