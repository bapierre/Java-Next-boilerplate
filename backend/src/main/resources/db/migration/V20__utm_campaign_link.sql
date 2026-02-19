-- Link UTM links to paid ad campaigns (optional association)
ALTER TABLE utm_links
    ADD COLUMN campaign_id BIGINT REFERENCES paid_ad_campaigns(id) ON DELETE SET NULL;

CREATE INDEX idx_utm_links_campaign ON utm_links(campaign_id);
