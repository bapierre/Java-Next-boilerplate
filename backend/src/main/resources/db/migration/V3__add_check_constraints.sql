-- Add CHECK constraints on status and provider columns
ALTER TABLE subscriptions
    ADD CONSTRAINT chk_subscription_status
    CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid', 'paused'));

ALTER TABLE subscriptions
    ADD CONSTRAINT chk_subscription_provider
    CHECK (provider IN ('stripe'));
