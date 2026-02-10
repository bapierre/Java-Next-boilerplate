-- EnumType.STRING stores uppercase enum names (TIKTOK, INSTAGRAM, etc.)
-- but the CHECK constraint expected lowercase. Fix both the constraint and existing data.

-- First, update any existing lowercase values to uppercase
UPDATE channels SET platform = UPPER(platform) WHERE platform != UPPER(platform);

-- Replace the constraint to accept uppercase values
ALTER TABLE channels DROP CONSTRAINT IF EXISTS check_platform;
ALTER TABLE channels ADD CONSTRAINT check_platform CHECK (platform IN ('TIKTOK', 'INSTAGRAM', 'YOUTUBE', 'TWITTER', 'LINKEDIN', 'FACEBOOK'));
