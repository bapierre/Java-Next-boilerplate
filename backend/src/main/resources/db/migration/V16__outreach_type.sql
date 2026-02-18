ALTER TABLE cold_outreaches
    ADD COLUMN IF NOT EXISTS type VARCHAR(10) NOT NULL DEFAULT 'COLD';

ALTER TABLE cold_outreaches
    ADD CONSTRAINT chk_outreach_type CHECK (type IN ('WARM', 'COLD'));
