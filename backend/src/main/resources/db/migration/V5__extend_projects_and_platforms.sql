-- Add image_url and category columns to saas_projects
ALTER TABLE saas_projects ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
ALTER TABLE saas_projects ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Drop old platform CHECK constraint and add new one including twitter, linkedin, facebook
ALTER TABLE channels DROP CONSTRAINT IF EXISTS check_platform;
ALTER TABLE channels ADD CONSTRAINT check_platform CHECK (platform IN ('tiktok', 'instagram', 'youtube', 'twitter', 'linkedin', 'facebook'));
