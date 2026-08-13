-- Create device_tokens table for push notifications
CREATE TABLE IF NOT EXISTS device_tokens (
    token text PRIMARY KEY,
    platform text,
    created_at timestamp with time zone DEFAULT now()
);

-- Create job_subscriptions table if users want to subscribe to specific job updates
CREATE TABLE IF NOT EXISTS job_subscriptions (
    job_id bigint, -- or text, depending on your jobs.id type
    token text REFERENCES device_tokens(token) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (job_id, token)
);

-- Allow public insert/upsert so the app can register tokens
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to device_tokens" ON device_tokens
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to device_tokens" ON device_tokens
    FOR UPDATE USING (true);

CREATE POLICY "Allow public insert to job_subscriptions" ON job_subscriptions
    FOR INSERT WITH CHECK (true);
