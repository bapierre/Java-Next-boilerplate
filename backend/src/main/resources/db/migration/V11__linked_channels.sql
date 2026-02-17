CREATE TABLE IF NOT EXISTS linked_channels (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES saas_projects(id) ON DELETE CASCADE,
    channel_id BIGINT NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, channel_id)
);

CREATE INDEX idx_linked_channels_project ON linked_channels(project_id);
CREATE INDEX idx_linked_channels_channel ON linked_channels(channel_id);
