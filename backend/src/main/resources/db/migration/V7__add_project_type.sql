ALTER TABLE saas_projects ADD COLUMN IF NOT EXISTS type VARCHAR(50) NOT NULL DEFAULT 'PRODUCT';
ALTER TABLE saas_projects ADD CONSTRAINT check_project_type CHECK (type IN ('PRODUCT', 'PERSONAL_BRAND'));
CREATE INDEX IF NOT EXISTS idx_saas_projects_user_type ON saas_projects(user_id, type);

-- Auto-convert existing projects with personal brand categories
UPDATE saas_projects SET type = 'PERSONAL_BRAND'
WHERE category IN ('Creator / Influencer', 'Consultant', 'Coach / Trainer', 'Freelancer', 'Speaker / Author')
  AND type = 'PRODUCT';
