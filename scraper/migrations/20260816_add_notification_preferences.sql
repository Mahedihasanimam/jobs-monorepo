-- Add notification preference columns to device_tokens
ALTER TABLE device_tokens
ADD COLUMN IF NOT EXISTS wants_new_jobs boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS wants_deadlines boolean DEFAULT true;
