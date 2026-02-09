-- MarketiStats: Marketing Analytics Platform Schema
-- This migration creates tables for tracking marketing stats across multiple channels

-- Table: saas_projects
-- Represents different SaaS products that users are marketing
CREATE TABLE saas_projects (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_saas_projects_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: channels
-- Social media accounts connected to projects (TikTok, Instagram, YouTube)
CREATE TABLE channels (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL,
    platform VARCHAR(50) NOT NULL, -- 'tiktok', 'instagram', 'youtube'
    channel_name VARCHAR(255) NOT NULL,
    channel_id VARCHAR(255), -- Platform-specific ID (e.g., TikTok user ID)
    channel_url VARCHAR(500),
    access_token TEXT, -- OAuth token (should be encrypted in production)
    refresh_token TEXT, -- OAuth refresh token
    token_expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    last_synced_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_channels_project FOREIGN KEY (project_id) REFERENCES saas_projects(id) ON DELETE CASCADE,
    CONSTRAINT unique_channel_per_project UNIQUE (project_id, platform, channel_id),
    CONSTRAINT check_platform CHECK (platform IN ('tiktok', 'instagram', 'youtube'))
);

-- Table: posts
-- Individual content pieces published on channels
CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,
    channel_id BIGINT NOT NULL,
    platform_post_id VARCHAR(255) NOT NULL, -- Platform-specific post ID
    title VARCHAR(500),
    description TEXT,
    post_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    video_url VARCHAR(500),
    duration_seconds INTEGER, -- For video content
    published_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_posts_channel FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    CONSTRAINT unique_post_per_channel UNIQUE (channel_id, platform_post_id)
);

-- Table: channel_stats
-- Time-series metrics for channels (historical data)
CREATE TABLE channel_stats (
    id BIGSERIAL PRIMARY KEY,
    channel_id BIGINT NOT NULL,
    recorded_at TIMESTAMP NOT NULL,
    followers_count BIGINT DEFAULT 0,
    following_count BIGINT DEFAULT 0,
    total_posts INTEGER DEFAULT 0,
    total_views BIGINT DEFAULT 0,
    total_likes BIGINT DEFAULT 0,
    engagement_rate DECIMAL(5,2), -- Percentage (e.g., 3.45 for 3.45%)
    avg_views_per_post BIGINT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_channel_stats_channel FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE
);

-- Table: post_stats
-- Time-series metrics for individual posts
CREATE TABLE post_stats (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL,
    recorded_at TIMESTAMP NOT NULL,
    views_count BIGINT DEFAULT 0,
    likes_count BIGINT DEFAULT 0,
    comments_count BIGINT DEFAULT 0,
    shares_count BIGINT DEFAULT 0,
    saves_count BIGINT DEFAULT 0,
    engagement_rate DECIMAL(5,2), -- Percentage
    watch_time_seconds BIGINT DEFAULT 0, -- For video content
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_post_stats_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Indexes for query performance
CREATE INDEX idx_saas_projects_user_id ON saas_projects(user_id);
CREATE INDEX idx_channels_project_id ON channels(project_id);
CREATE INDEX idx_channels_platform ON channels(platform);
CREATE INDEX idx_channels_active ON channels(is_active) WHERE is_active = true;
CREATE INDEX idx_posts_channel_id ON posts(channel_id);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX idx_channel_stats_channel_recorded ON channel_stats(channel_id, recorded_at DESC);
CREATE INDEX idx_post_stats_post_recorded ON post_stats(post_id, recorded_at DESC);

-- Composite index for common queries
CREATE INDEX idx_channels_project_platform ON channels(project_id, platform);
CREATE INDEX idx_posts_channel_published ON posts(channel_id, published_at DESC);

-- Comments for documentation
COMMENT ON TABLE saas_projects IS 'SaaS products that users are marketing';
COMMENT ON TABLE channels IS 'Social media accounts (TikTok, Instagram, YouTube) connected to projects';
COMMENT ON TABLE posts IS 'Individual content pieces published on channels';
COMMENT ON TABLE channel_stats IS 'Time-series metrics for channels to track growth over time';
COMMENT ON TABLE post_stats IS 'Time-series metrics for posts to track performance over time';
