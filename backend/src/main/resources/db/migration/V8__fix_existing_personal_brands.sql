-- Convert existing projects with personal brand categories to PERSONAL_BRAND type
UPDATE saas_projects SET type = 'PERSONAL_BRAND'
WHERE category IN ('Creator / Influencer', 'Consultant', 'Coach / Trainer', 'Freelancer', 'Speaker / Author')
  AND type = 'PRODUCT';
