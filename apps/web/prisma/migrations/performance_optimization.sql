-- Database performance optimization for Inbox Zero
-- Add composite indexes for common query patterns

-- Email queries optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_emails_user_date 
ON emails (user_id, received_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_emails_account_date 
ON emails (email_account_id, received_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_emails_thread_date 
ON emails (thread_id, received_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_emails_account_unread 
ON emails (email_account_id, read) 
WHERE read = false;

-- Rule queries optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rules_enabled_account 
ON email_rules (email_account_id, enabled) 
WHERE enabled = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rules_account_type 
ON email_rules (email_account_id, type);

-- Label queries optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_labels_account 
ON labels (email_account_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_labels_user 
ON labels (user_id);

-- Folder queries optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_folders_account 
ON folders (email_account_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_folders_user 
ON folders (user_id);

-- User session queries optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_user_expires 
ON sessions (user_id, expires);

-- Account queries optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_user 
ON email_accounts (user_id);

-- Category queries optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_user 
ON categories (user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_account 
ON categories (email_account_id);

-- AI queue optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_queue_status_created 
ON ai_queue (status, created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_queue_type_status 
ON ai_queue (type, status);

-- Archive queue optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_archive_queue_status_created 
ON archive_queue (status, created_at);

-- Partial indexes for filtering (PostgreSQL 11+)
DO $$
BEGIN;
    -- Email partial indexes for common filters
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_emails_account_read_partial 
    ON emails (email_account_id) 
    WHERE read = false;

    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_emails_account_important_partial 
    ON emails (email_account_id) 
    WHERE important = true;

    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_emails_user_date_partial 
    ON emails (user_id, received_at DESC) 
    WHERE received_at > NOW() - INTERVAL '90 days';
END $$;

-- Update table statistics for better query planning
ANALYZE emails;
ANALYZE email_rules;
ANALYZE labels;
ANALYZE folders;
ANALYZE sessions;
ANALYZE email_accounts;
ANALYZE categories;
ANALYZE ai_queue;
ANALYZE archive_queue;

-- Create materialized views for complex queries
CREATE MATERIALIZED VIEW IF NOT EXISTS email_stats AS
SELECT 
    e.user_id,
    e.email_account_id,
    COUNT(*) as total_emails,
    COUNT(CASE WHEN e.read = false THEN 1 END) as unread_count,
    COUNT(CASE WHEN e.important = true THEN 1 END) as important_count,
    MAX(e.received_at) as latest_email_date,
    MIN(e.received_at) as oldest_email_date
FROM emails e
GROUP BY e.user_id, e.email_account_id;

-- Create indexes for materialized view
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_stats_user 
ON email_stats (user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_stats_account 
ON email_stats (email_account_id);

-- Refresh materialized view periodically
CREATE OR REPLACE FUNCTION refresh_email_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY email_stats;
END;
$$ LANGUAGE plpgsql;

-- Schedule refresh (requires pg_cron extension)
-- SELECT cron.schedule('refresh-email-stats', '0 */5 * * * *', 'SELECT refresh_email_stats();');

-- Query performance monitoring setup
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Create a table to track slow queries
CREATE TABLE IF NOT EXISTS slow_query_log (
    id SERIAL PRIMARY KEY,
    query TEXT,
    execution_time INTEGER,
    timestamp TIMESTAMP DEFAULT NOW(),
    user_id TEXT,
    email_account_id TEXT
);

-- Function to log slow queries
CREATE OR REPLACE FUNCTION log_slow_query()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.total_exec_time > 1000) THEN -- Log queries taking more than 1 second
        INSERT INTO slow_query_log (query, execution_time, user_id, email_account_id)
        VALUES (
            current_query(),
            NEW.total_exec_time,
            current_setting('request.jwt.claims.user_id'),
            current_setting('request.jwt.claims.email_account_id')
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Performance optimization comments
COMMENT ON TABLE emails IS 'Core email table with indexes on user_id, email_account_id, thread_id, and received_at for optimal query performance';
COMMENT ON TABLE email_rules IS 'Email rules table with indexes on email_account_id and enabled status for fast rule lookups';
COMMENT ON TABLE labels IS 'Labels table with indexes on user_id and email_account_id for efficient label management';
COMMENT ON TABLE folders IS 'Folders table with indexes on user_id and email_account_id for hierarchical folder operations';
COMMENT ON TABLE sessions IS 'User sessions table with index on user_id and expires for session cleanup and validation';
COMMENT ON MATERIALIZED VIEW email_stats IS 'Materialized view for email statistics, refreshed every 5 minutes for fast dashboard queries';