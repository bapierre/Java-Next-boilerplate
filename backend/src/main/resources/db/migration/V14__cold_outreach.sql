-- Cold outreach tracker: templates + contacts

CREATE TABLE IF NOT EXISTS outreach_templates (
    id          BIGSERIAL PRIMARY KEY,
    project_id  BIGINT NOT NULL REFERENCES saas_projects(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    content     TEXT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_outreach_templates_project ON outreach_templates(project_id);

CREATE TABLE IF NOT EXISTS cold_outreaches (
    id            BIGSERIAL PRIMARY KEY,
    project_id    BIGINT NOT NULL REFERENCES saas_projects(id) ON DELETE CASCADE,
    platform      VARCHAR(50)  NOT NULL,
    handle        VARCHAR(255) NOT NULL,
    profile_url   VARCHAR(512),
    template_id   BIGINT REFERENCES outreach_templates(id) ON DELETE SET NULL,
    message_sent  TEXT,
    notes         TEXT,
    status        VARCHAR(20)  NOT NULL DEFAULT 'ONGOING',
    contacted_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT cold_outreaches_status_check CHECK (status IN ('ONGOING', 'SUCCESS', 'FAIL')),
    CONSTRAINT cold_outreaches_unique_contact UNIQUE (project_id, platform, handle)
);

CREATE INDEX idx_cold_outreaches_project   ON cold_outreaches(project_id);
CREATE INDEX idx_cold_outreaches_status    ON cold_outreaches(project_id, status);

-- RLS
ALTER TABLE outreach_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE cold_outreaches    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "backend_full_access" ON outreach_templates
    TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "backend_full_access" ON cold_outreaches
    TO service_role USING (true) WITH CHECK (true);
