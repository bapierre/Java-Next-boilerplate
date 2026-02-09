-- Add composite index for common query pattern: user subscriptions by status
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id_status ON subscriptions(user_id, status);
