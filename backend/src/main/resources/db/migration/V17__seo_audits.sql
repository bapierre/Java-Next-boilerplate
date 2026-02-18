CREATE TABLE IF NOT EXISTS seo_audits (
    id          BIGSERIAL PRIMARY KEY,
    project_id  BIGINT        NOT NULL REFERENCES saas_projects(id) ON DELETE CASCADE,
    url         VARCHAR(2000) NOT NULL,
    score       INTEGER       NOT NULL,
    pass_count  INTEGER       NOT NULL,
    warn_count  INTEGER       NOT NULL,
    fail_count  INTEGER       NOT NULL,
    checks      JSONB         NOT NULL DEFAULT '[]',
    audited_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_seo_audits_project ON seo_audits(project_id);
