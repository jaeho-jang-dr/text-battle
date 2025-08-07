-- Admin logs table for audit trail
CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    target_id VARCHAR(255),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at DESC);
CREATE INDEX idx_admin_logs_action ON admin_logs(action);

-- Function to get battles by hour (for statistics)
CREATE OR REPLACE FUNCTION get_battles_by_hour()
RETURNS TABLE(hour INTEGER, count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(HOUR FROM created_at)::INTEGER as hour,
        COUNT(*)::BIGINT as count
    FROM battles
    WHERE created_at >= NOW() - INTERVAL '24 hours'
    GROUP BY hour
    ORDER BY hour;
END;
$$ LANGUAGE plpgsql;