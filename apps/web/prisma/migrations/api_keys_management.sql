-- API Keys Management Migration
-- Creates tables for secure API key generation, management, and auditing

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY DEFAULT encode(decode(random()::text, 'UTF8'), 'hex'),
    key_id TEXT UNIQUE NOT NULL,
    key_type VARCHAR(20) NOT NULL CHECK (key_type IN ('dev', 'prod', 'svc')),
    name TEXT NOT NULL,
    description TEXT,
    hashed_key VARCHAR(255) NOT NULL,
    salt VARCHAR(32) NOT NULL,
    scopes TEXT NOT NULL DEFAULT '[]',
    permissions JSONB NOT NULL DEFAULT '{}',
    user_id TEXT NOT NULL,
    email_account_id TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER NOT NULL DEFAULT 0,
    rate_limit_per_hour INTEGER DEFAULT 1000,
    ip_restrictions TEXT DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT,
    
    -- Foreign key constraints
    CONSTRAINT fk_api_keys_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_api_keys_email_account 
        FOREIGN KEY (email_account_id) 
        REFERENCES email_accounts(id) 
        ON DELETE SET NULL
);

-- Key usage logs table
CREATE TABLE IF NOT EXISTS api_key_usage_logs (
    id TEXT PRIMARY KEY DEFAULT encode(decode(random()::text, 'UTF8'), 'hex'),
    api_key_id TEXT NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER,
    request_size_bytes INTEGER,
    response_size_bytes INTEGER,
    ip_address INET,
    user_agent TEXT,
    error_message TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraint
    CONSTRAINT fk_api_key_usage_logs_api_key 
        FOREIGN KEY (api_key_id) 
        REFERENCES api_keys(id) 
        ON DELETE CASCADE
);

-- Key audit trail table
CREATE TABLE IF NOT EXISTS api_key_audit_trail (
    id TEXT PRIMARY KEY DEFAULT encode(decode(random()::text, 'UTF8'), 'hex'),
    api_key_id TEXT NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('create', 'rotate', 'revoke', 'suspend', 'reactivate', 'update_permissions', 'view')),
    performed_by TEXT NOT NULL,
    reason TEXT,
    previous_values JSONB,
    new_values JSONB,
    ip_address INET,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraint
    CONSTRAINT fk_api_key_audit_trail_api_key 
        FOREIGN KEY (api_key_id) 
        REFERENCES api_keys(id) 
        ON DELETE CASCADE
);

-- Key rotation schedules table
CREATE TABLE IF NOT EXISTS api_key_rotation_schedules (
    id TEXT PRIMARY KEY DEFAULT encode(decode(random()::text, 'UTF8'), 'hex'),
    api_key_id TEXT NOT NULL,
    rotation_type VARCHAR(20) NOT NULL CHECK (rotation_type IN ('scheduled', 'usage_based', 'security_triggered', 'manual')),
    next_rotation_at TIMESTAMP WITH TIME ZONE NOT NULL,
    grace_period_hours INTEGER DEFAULT 24,
    notification_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT NOT NULL,
    
    -- Foreign key constraint
    CONSTRAINT fk_api_key_rotation_schedules_api_key 
        FOREIGN KEY (api_key_id) 
        REFERENCES api_keys(id) 
        ON DELETE CASCADE
);

-- API key roles table
CREATE TABLE IF NOT EXISTS api_key_roles (
    id TEXT PRIMARY KEY DEFAULT encode(decode(random()::text, 'UTF8'), 'hex'),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{}',
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API key role assignments table
CREATE TABLE IF NOT EXISTS api_key_role_assignments (
    id TEXT PRIMARY KEY DEFAULT encode(decode(random()::text, 'UTF8'), 'hex'),
    api_key_id TEXT NOT NULL,
    role_id TEXT NOT NULL,
    assigned_by TEXT,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_api_key_role_assignments_api_key 
        FOREIGN KEY (api_key_id) 
        REFERENCES api_keys(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_api_key_role_assignments_role 
        FOREIGN KEY (role_id) 
        REFERENCES api_key_roles(id) 
        ON DELETE CASCADE,
    
    -- Ensure unique assignment
    UNIQUE(api_key_id, role_id)
);

-- Security events table
CREATE TABLE IF NOT EXISTS api_key_security_events (
    id TEXT PRIMARY KEY DEFAULT encode(decode(random()::text, 'UTF8'), 'hex'),
    api_key_id TEXT,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('failed_auth', 'rate_limit_exceeded', 'ip_blocked', 'unusual_usage', 'compromise_suspected', 'access_revoked')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraint
    CONSTRAINT fk_api_key_security_events_api_key 
        FOREIGN KEY (api_key_id) 
        REFERENCES api_keys(id) 
        ON DELETE SET NULL
);

-- Indexes for API keys table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_keys_email_account_id ON api_keys(email_account_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_keys_type_active ON api_keys(key_type, is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_keys_expires_at ON api_keys(expires_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_keys_created_at ON api_keys(created_at);

-- Indexes for usage logs
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_key_usage_logs_api_key_id ON api_key_usage_logs(api_key_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_key_usage_logs_timestamp ON api_key_usage_logs(timestamp);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_key_usage_logs_endpoint ON api_key_usage_logs(endpoint);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_key_usage_logs_status_code ON api_key_usage_logs(status_code);

-- Indexes for audit trail
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_key_audit_trail_api_key_id ON api_key_audit_trail(api_key_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_key_audit_trail_timestamp ON api_key_audit_trail(timestamp);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_key_audit_trail_action ON api_key_audit_trail(action);

-- Indexes for rotation schedules
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_key_rotation_schedules_next_rotation ON api_key_rotation_schedules(next_rotation_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_key_rotation_schedules_api_key_id ON api_key_rotation_schedules(api_key_id);

-- Indexes for security events
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_key_security_events_api_key_id ON api_key_security_events(api_key_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_key_security_events_timestamp ON api_key_security_events(timestamp);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_key_security_events_event_type ON api_key_security_events(event_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_key_security_events_severity ON api_key_security_events(severity);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_key_security_events_resolved ON api_key_security_events(resolved);

-- Table comments for documentation
COMMENT ON TABLE api_keys IS 'Secure API keys with role-based permissions, usage tracking, and audit trail';
COMMENT ON TABLE api_key_usage_logs IS 'Detailed usage logs for API keys with performance metrics and security monitoring';
COMMENT ON TABLE api_key_audit_trail IS 'Complete audit trail for all API key operations including creation, rotation, and revocation';
COMMENT ON TABLE api_key_rotation_schedules IS 'Automated rotation schedules with configurable policies and grace periods';
COMMENT ON TABLE api_key_roles IS 'Predefined roles with permission sets for role-based access control';
COMMENT ON TABLE api_key_role_assignments IS 'Many-to-many relationship between API keys and roles';
COMMENT ON TABLE api_key_security_events IS 'Security event tracking for anomaly detection and incident response';

-- Create default roles
INSERT INTO api_key_roles (id, name, description, permissions, is_system_role) VALUES
('role_admin', 'Administrator', '{"admin": true, "read": true, "write": true, "delete": true}', true),
('role_developer', 'Developer', '{"read": true, "write": true, "delete": false}', true),
('role_readonly', 'Read Only', '{"read": true, "write": false, "delete": false}', true),
('role_service', 'Service', '{"service": true, "internal": true}', true);

-- Create function to check API key permissions
CREATE OR REPLACE FUNCTION check_api_key_permissions(
    p_api_key_id TEXT,
    p_required_permission TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_permissions JSONB;
BEGIN
    -- Get the key's permissions
    SELECT permissions INTO v_permissions
    FROM api_keys
    WHERE id = p_api_key_id 
      AND is_active = true 
      AND expires_at > NOW();
    
    -- Return false if key doesn't exist or is expired
    IF v_permissions IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if the required permission exists in the key's permissions
    RETURN (v_permissions::jsonb ? p_required_permission = ANY(v_permissions::jsonb->>text) : FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log API key usage
CREATE OR REPLACE FUNCTION log_api_key_usage(
    p_api_key_id TEXT,
    p_endpoint VARCHAR(255),
    p_status_code INTEGER,
    p_response_time_ms INTEGER DEFAULT NULL,
    p_request_size_bytes INTEGER DEFAULT NULL,
    p_response_size_bytes INTEGER DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    -- Update usage count on the API key
    UPDATE api_keys 
    SET 
        usage_count = usage_count + 1,
        last_used_at = NOW()
    WHERE id = p_api_key_id;
    
    -- Insert usage log entry
    INSERT INTO api_key_usage_logs (
        api_key_id,
        endpoint,
        status_code,
        response_time_ms,
        request_size_bytes,
        response_size_bytes,
        ip_address,
        user_agent,
        error_message
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic key expiration
CREATE OR REPLACE FUNCTION check_api_key_expiration() RETURNS TRIGGER AS $$
BEGIN
    -- Deactivate expired keys
    UPDATE api_keys 
    SET is_active = false 
    WHERE expires_at <= NOW() AND is_active = true;
    
    -- Log expiration event
    INSERT INTO api_key_audit_trail (
        api_key_id,
        action,
        performed_by,
        reason,
        timestamp
    ) SELECT 
        id,
        'expire',
        'system',
        'Key expired automatically',
        NOW()
    FROM api_keys 
    WHERE expires_at <= NOW() AND is_active = true;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to check expiration on API keys
CREATE TRIGGER trigger_check_api_key_expiration
    AFTER INSERT OR UPDATE ON api_keys
    FOR EACH ROW
    EXECUTE FUNCTION check_api_key_expiration();

-- Create view for active API keys with usage stats
CREATE MATERIALIZED VIEW IF NOT EXISTS active_api_keys_stats AS
SELECT 
    ak.id,
    ak.key_id,
    ak.name,
    ak.key_type,
    ak.scopes,
    ak.user_id,
    ak.email_account_id,
    ak.expires_at,
    ak.usage_count,
    ak.last_used_at,
    COALESCE(aul24h.usage_count, 0) as usage_24h,
    COALESCE(aul7d.usage_count, 0) as usage_7d,
    COALESCE(aul30d.usage_count, 0) as usage_30d
FROM api_keys ak
LEFT JOIN LATERAL (
    SELECT api_key_id, COUNT(*) as usage_count
    FROM api_key_usage_logs 
    WHERE timestamp >= NOW() - INTERVAL '24 hours'
    GROUP BY api_key_id
) aul24h ON ak.id = aul24h.api_key_id
LEFT JOIN LATERAL (
    SELECT api_key_id, COUNT(*) as usage_count
    FROM api_key_usage_logs 
    WHERE timestamp >= NOW() - INTERVAL '7 days'
    GROUP BY api_key_id
) aul7d ON ak.id = aul7d.api_key_id
LEFT JOIN LATERAL (
    SELECT api_key_id, COUNT(*) as usage_count
    FROM api_key_usage_logs 
    WHERE timestamp >= NOW() - INTERVAL '30 days'
    GROUP BY api_key_id
) aul30d ON ak.id = aul30d.api_key_id
WHERE ak.is_active = true;

-- Create index for materialized view
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_active_api_keys_stats_id ON active_api_keys_stats(id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_active_api_keys_stats_user_id ON active_api_keys_stats(user_id);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_active_api_keys_stats() RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY active_api_keys_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule refresh (requires pg_cron extension)
-- SELECT cron.schedule('refresh-api-keys-stats', '0 */1 * * * *', 'SELECT refresh_active_api_keys_stats();');

-- Update table statistics
ANALYZE api_keys;
ANALYZE api_key_usage_logs;
ANALYZE api_key_audit_trail;
ANALYZE api_key_rotation_schedules;
ANALYZE api_key_roles;
ANALYZE api_key_role_assignments;
ANALYZE api_key_security_events;