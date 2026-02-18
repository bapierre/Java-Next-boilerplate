CREATE TABLE IF NOT EXISTS affiliate_campaigns (
    id              BIGSERIAL PRIMARY KEY,
    project_id      BIGINT        NOT NULL REFERENCES saas_projects(id) ON DELETE CASCADE,
    name            VARCHAR(200)  NOT NULL,
    destination_url VARCHAR(2000) NOT NULL,
    slug            VARCHAR(50)   NOT NULL UNIQUE,
    is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_affiliate_campaigns_project ON affiliate_campaigns(project_id);
CREATE INDEX idx_affiliate_campaigns_slug    ON affiliate_campaigns(slug);

CREATE TABLE IF NOT EXISTS affiliate_click_daily (
    campaign_id   BIGINT  NOT NULL REFERENCES affiliate_campaigns(id) ON DELETE CASCADE,
    date          DATE    NOT NULL,
    total_clicks  INT     NOT NULL DEFAULT 0,
    unique_clicks INT     NOT NULL DEFAULT 0,
    by_referer    JSONB   NOT NULL DEFAULT '{}',
    by_device     JSONB   NOT NULL DEFAULT '{}',
    PRIMARY KEY (campaign_id, date)
);
CREATE INDEX idx_affiliate_click_daily_campaign ON affiliate_click_daily(campaign_id);
