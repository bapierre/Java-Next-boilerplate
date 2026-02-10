-- Add follower_count to channels for display in the dashboard
ALTER TABLE channels ADD COLUMN IF NOT EXISTS follower_count BIGINT;
