-- Fix device_tokens policies
-- Add SELECT policy so getNotificationPreferences works and ON CONFLICT UPDATE works
CREATE POLICY "Allow public select from device_tokens" ON device_tokens
    FOR SELECT USING (true);

-- Fix job_subscriptions policies
-- Add SELECT policy
CREATE POLICY "Allow public select from job_subscriptions" ON job_subscriptions
    FOR SELECT USING (true);

-- Add UPDATE policy for job_subscriptions
CREATE POLICY "Allow public update to job_subscriptions" ON job_subscriptions
    FOR UPDATE USING (true);
