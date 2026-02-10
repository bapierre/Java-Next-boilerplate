-- Enable Row Level Security on all public tables.
-- The backend connects via JDBC as the 'postgres' role which already has BYPASSRLS on Supabase.
-- This blocks direct access through Supabase PostgREST (anon/authenticated roles).

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saas_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_stats ENABLE ROW LEVEL SECURITY;

-- No policies are created intentionally — the anon and authenticated roles
-- get zero access, which is correct since all data access goes through
-- the Spring Boot backend, not Supabase client queries.
