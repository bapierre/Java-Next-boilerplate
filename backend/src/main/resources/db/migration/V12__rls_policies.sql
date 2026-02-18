-- RLS policies for all tables.
--
-- Architecture: all data access goes through the Spring Boot backend (JDBC as
-- the 'postgres' role, which has BYPASSRLS on Supabase). Direct PostgREST
-- access (anon / authenticated roles) is intentionally blocked.
--
-- Each table gets a single "service_role full access" policy. This satisfies
-- Supabase's linter while making the security model explicit: only the backend
-- service role can read or write data.

-- ─── linked_channels (added in V11 without RLS) ────────────────────────────

ALTER TABLE linked_channels ENABLE ROW LEVEL SECURITY;

-- ─── Policies (one per table, service_role only) ───────────────────────────

CREATE POLICY "backend_full_access" ON users
    TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "backend_full_access" ON subscriptions
    TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "backend_full_access" ON saas_projects
    TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "backend_full_access" ON channels
    TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "backend_full_access" ON channel_stats
    TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "backend_full_access" ON posts
    TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "backend_full_access" ON post_stats
    TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "backend_full_access" ON linked_channels
    TO service_role USING (true) WITH CHECK (true);
