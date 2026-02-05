-- TerraRun Database Schema
-- PostgreSQL 15+ with PostGIS 3.3+

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "postgis_topology";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================================================
-- USERS & AUTHENTICATION
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Profile
    full_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    location GEOMETRY(POINT, 4326), -- User's home location
    
    -- Stats
    total_distance_m INTEGER DEFAULT 0,
    total_activities INTEGER DEFAULT 0,
    territories_captured INTEGER DEFAULT 0,
    territories_held INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_activity_date DATE,
    
    -- Economy
    terracoins_balance INTEGER DEFAULT 0,
    total_terracoins_earned INTEGER DEFAULT 0,
    
    -- Premium
    is_premium BOOLEAN DEFAULT FALSE,
    premium_expires_at TIMESTAMP,
    
    -- Settings
    preferred_mode VARCHAR(10) DEFAULT 'running', -- 'running' or 'cycling'
    units VARCHAR(10) DEFAULT 'metric', -- 'metric' or 'imperial'
    privacy_mode VARCHAR(20) DEFAULT 'public', -- 'public', 'friends', 'private'
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    
    CHECK (preferred_mode IN ('running', 'cycling')),
    CHECK (units IN ('metric', 'imperial')),
    CHECK (privacy_mode IN ('public', 'friends', 'private'))
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_location ON users USING GIST(location);
CREATE INDEX idx_users_streak ON users(streak_days DESC);

-- ============================================================================
-- TEAMS
-- ============================================================================

CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    avatar_url TEXT,
    
    creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Stats
    member_count INTEGER DEFAULT 0,
    total_territories INTEGER DEFAULT 0,
    total_distance_m INTEGER DEFAULT 0,
    
    -- Settings
    is_public BOOLEAN DEFAULT TRUE,
    max_members INTEGER DEFAULT 6,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CHECK (max_members >= 2 AND max_members <= 6)
);

CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    role VARCHAR(20) DEFAULT 'member', -- 'admin', 'member'
    joined_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(team_id, user_id),
    CHECK (role IN ('admin', 'member'))
);

CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);

-- ============================================================================
-- ACTIVITIES
-- ============================================================================

CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    
    -- Activity Details
    mode VARCHAR(10) NOT NULL, -- 'running' or 'cycling'
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    duration_seconds INTEGER GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (end_time - start_time))::INTEGER) STORED,
    
    -- GPS Data
    gps_track GEOMETRY(LINESTRING, 4326) NOT NULL,
    gps_track_simplified GEOMETRY(LINESTRING, 4326), -- Compressed for fast rendering
    start_point GEOMETRY(POINT, 4326) NOT NULL,
    end_point GEOMETRY(POINT, 4326) NOT NULL,
    
    -- Metrics
    distance_m INTEGER NOT NULL,
    avg_speed_kmh DECIMAL(5,2),
    max_speed_kmh DECIMAL(5,2),
    avg_pace_sec_per_km INTEGER, -- For running
    elevation_gain_m INTEGER DEFAULT 0,
    elevation_loss_m INTEGER DEFAULT 0,
    
    -- Heart Rate (optional)
    avg_heart_rate INTEGER,
    max_heart_rate INTEGER,
    heart_rate_data JSONB, -- Array of HR readings
    
    -- Game Data
    is_loop BOOLEAN DEFAULT FALSE,
    captured_territory_id UUID,
    terracoins_earned INTEGER DEFAULT 0,
    
    -- Anti-Cheat
    anti_cheat_score DECIMAL(3,2) NOT NULL, -- 0.00 to 1.00
    anti_cheat_details JSONB,
    status VARCHAR(20) DEFAULT 'valid', -- 'valid', 'invalid', 'under_review', 'private'
    
    -- Metadata
    device_info JSONB,
    weather_conditions JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    
    CHECK (mode IN ('running', 'cycling')),
    CHECK (status IN ('valid', 'invalid', 'under_review', 'private')),
    CHECK (distance_m > 0),
    CHECK (anti_cheat_score >= 0 AND anti_cheat_score <= 1)
);

CREATE INDEX idx_activities_user ON activities(user_id);
CREATE INDEX idx_activities_track ON activities USING GIST(gps_track);
CREATE INDEX idx_activities_start_time ON activities(start_time DESC);
CREATE INDEX idx_activities_mode ON activities(mode);
CREATE INDEX idx_activities_status ON activities(status);

-- ============================================================================
-- TERRITORIES
-- ============================================================================

CREATE TABLE territories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    
    -- Geometry
    geometry GEOMETRY(POLYGON, 4326) NOT NULL,
    centroid GEOMETRY(POINT, 4326) GENERATED ALWAYS AS (ST_Centroid(geometry)) STORED,
    area_km2 DECIMAL(10,4) GENERATED ALWAYS AS (ST_Area(geometry::geography) / 1000000.0) STORED,
    perimeter_m INTEGER,
    
    -- Naming
    name VARCHAR(200),
    auto_generated_name VARCHAR(200), -- e.g., "Central Park Loop"
    
    -- Game Mechanics
    mode VARCHAR(10) NOT NULL, -- 'running' or 'cycling'
    shield_hp INTEGER DEFAULT 100,
    max_shield_hp INTEGER DEFAULT 100,
    fortification_count INTEGER DEFAULT 0,
    
    -- Timing
    captured_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '7 days',
    last_defended_at TIMESTAMP,
    
    -- References
    original_activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
    capture_count INTEGER DEFAULT 1, -- How many times this territory has been captured
    
    -- Stats
    total_rent_earned INTEGER DEFAULT 0,
    successful_defenses INTEGER DEFAULT 0,
    
    -- Metadata
    difficulty_multiplier DECIMAL(3,2) DEFAULT 1.0,
    population_density INTEGER, -- People per km²
    terrain_type VARCHAR(20), -- 'urban', 'suburban', 'rural', 'mountain'
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CHECK (mode IN ('running', 'cycling')),
    CHECK (shield_hp >= 0),
    CHECK (terrain_type IN ('urban', 'suburban', 'rural', 'mountain'))
);

CREATE INDEX idx_territories_owner ON territories(owner_id);
CREATE INDEX idx_territories_team ON territories(team_id);
CREATE INDEX idx_territories_geom ON territories USING GIST(geometry);
CREATE INDEX idx_territories_centroid ON territories USING GIST(centroid);
CREATE INDEX idx_territories_expires ON territories(expires_at);
CREATE INDEX idx_territories_mode ON territories(mode);

-- ============================================================================
-- SEGMENTS (Individual Roads/Paths)
-- ============================================================================

CREATE TABLE segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    osm_way_id BIGINT, -- OpenStreetMap Way ID
    
    -- Geometry
    geometry GEOMETRY(LINESTRING, 4326) NOT NULL,
    length_m INTEGER NOT NULL,
    
    -- Details
    name VARCHAR(255),
    segment_type VARCHAR(50), -- 'road', 'trail', 'path', 'track'
    surface VARCHAR(50), -- 'asphalt', 'concrete', 'gravel', 'dirt'
    
    -- Ownership
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    mode VARCHAR(10) NOT NULL,
    ownership_type VARCHAR(20), -- 'speed', 'frequency', 'distance'
    
    -- Records
    fastest_pace_sec_per_km INTEGER,
    fastest_speed_kmh DECIMAL(5,2),
    record_holder_id UUID REFERENCES users(id) ON DELETE SET NULL,
    record_activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
    record_set_at TIMESTAMP,
    
    -- Stats
    total_traversals INTEGER DEFAULT 0,
    unique_users INTEGER DEFAULT 0,
    
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '7 days',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CHECK (mode IN ('running', 'cycling')),
    CHECK (ownership_type IN ('speed', 'frequency', 'distance'))
);

CREATE INDEX idx_segments_geom ON segments USING GIST(geometry);
CREATE INDEX idx_segments_owner ON segments(owner_id);
CREATE INDEX idx_segments_mode ON segments(mode);
CREATE INDEX idx_segments_osm ON segments(osm_way_id);

-- ============================================================================
-- VAULT & ECONOMY
-- ============================================================================

CREATE TABLE vault_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    amount INTEGER NOT NULL, -- Positive for earning, negative for spending
    balance_after INTEGER NOT NULL,
    
    transaction_type VARCHAR(30) NOT NULL, -- 'conquest', 'rent', 'streak', 'redemption', 'purchase', 'bonus'
    
    -- References
    reference_id UUID, -- Links to territory_id, activity_id, voucher_id
    reference_type VARCHAR(50), -- 'territory', 'activity', 'voucher', 'buff'
    
    description TEXT,
    metadata JSONB, -- Additional transaction details
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    CHECK (transaction_type IN ('conquest', 'rent', 'streak', 'redemption', 'purchase', 'bonus', 'team_bonus', 'defense'))
);

CREATE INDEX idx_vault_user ON vault_transactions(user_id);
CREATE INDEX idx_vault_created ON vault_transactions(created_at DESC);
CREATE INDEX idx_vault_type ON vault_transactions(transaction_type);

-- ============================================================================
-- VOUCHERS & MARKETPLACE
-- ============================================================================

CREATE TABLE vouchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Details
    name VARCHAR(200) NOT NULL,
    description TEXT,
    partner_name VARCHAR(100) NOT NULL, -- 'Nike', 'Starbucks', etc.
    partner_logo_url TEXT,
    
    -- Pricing
    cost_tc INTEGER NOT NULL,
    value_usd DECIMAL(10,2) NOT NULL,
    
    -- Availability
    tier VARCHAR(20) NOT NULL, -- 'bronze', 'silver', 'gold', 'platinum'
    stock_quantity INTEGER,
    max_per_user INTEGER DEFAULT 1,
    
    -- Validity
    valid_from TIMESTAMP DEFAULT NOW(),
    valid_until TIMESTAMP,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Stats
    redemption_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
    CHECK (cost_tc > 0),
    CHECK (value_usd > 0)
);

CREATE TABLE voucher_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    voucher_id UUID REFERENCES vouchers(id) ON DELETE CASCADE,
    
    code VARCHAR(100) UNIQUE NOT NULL,
    redeemed_at TIMESTAMP DEFAULT NOW(),
    used_at TIMESTAMP,
    
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'used', 'expired'
    
    CHECK (status IN ('active', 'used', 'expired'))
);

CREATE INDEX idx_redemptions_user ON voucher_redemptions(user_id);
CREATE INDEX idx_redemptions_code ON voucher_redemptions(code);

-- ============================================================================
-- BUFFS & POWER-UPS
-- ============================================================================

CREATE TABLE active_buffs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    buff_type VARCHAR(50) NOT NULL, -- 'ghost_mode', 'super_shield', 'xp_doubler', 'territory_scan'
    
    activated_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    
    target_territory_id UUID REFERENCES territories(id) ON DELETE CASCADE, -- For territory-specific buffs
    metadata JSONB,
    
    CHECK (buff_type IN ('ghost_mode', 'super_shield', 'xp_doubler', 'territory_scan', 'invulnerability'))
);

CREATE INDEX idx_active_buffs_user ON active_buffs(user_id);
CREATE INDEX idx_active_buffs_expires ON active_buffs(expires_at);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    notification_type VARCHAR(50) NOT NULL, -- 'invasion_alert', 'territory_lost', 'territory_captured', 'achievement'
    
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    
    data JSONB, -- Additional payload
    
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    CHECK (notification_type IN ('invasion_alert', 'territory_lost', 'territory_captured', 'achievement', 'team_invite', 'streak_milestone'))
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read, created_at);

-- ============================================================================
-- ACHIEVEMENTS
-- ============================================================================

CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    code VARCHAR(50) UNIQUE NOT NULL, -- 'first_capture', 'speed_demon', etc.
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url TEXT,
    
    tier VARCHAR(20) DEFAULT 'bronze', -- 'bronze', 'silver', 'gold', 'platinum', 'legendary'
    reward_tc INTEGER DEFAULT 0,
    
    unlock_criteria JSONB NOT NULL, -- Conditions to unlock
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    
    CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'legendary'))
);

CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    
    unlocked_at TIMESTAMP DEFAULT NOW(),
    progress JSONB, -- For multi-step achievements
    
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);

-- ============================================================================
-- INVASION EVENTS (Audit Trail)
-- ============================================================================

CREATE TABLE invasion_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    territory_id UUID REFERENCES territories(id) ON DELETE CASCADE,
    attacker_id UUID REFERENCES users(id) ON DELETE CASCADE,
    defender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    attack_activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
    
    damage_dealt INTEGER NOT NULL,
    shield_before INTEGER NOT NULL,
    shield_after INTEGER NOT NULL,
    
    invasion_result VARCHAR(20) NOT NULL, -- 'captured', 'defended', 'in_progress'
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    CHECK (invasion_result IN ('captured', 'defended', 'in_progress'))
);

CREATE INDEX idx_invasion_territory ON invasion_events(territory_id);
CREATE INDEX idx_invasion_attacker ON invasion_events(attacker_id);
CREATE INDEX idx_invasion_created ON invasion_events(created_at DESC);

-- ============================================================================
-- LEADERBOARDS (Materialized View for Performance)
-- ============================================================================

CREATE MATERIALIZED VIEW leaderboard_global AS
SELECT 
    u.id,
    u.username,
    u.avatar_url,
    u.territories_held,
    u.total_distance_m,
    u.total_terracoins_earned,
    u.streak_days,
    COUNT(DISTINCT t.id) as active_territories,
    SUM(t.area_km2) as total_area_controlled,
    ROW_NUMBER() OVER (ORDER BY u.territories_captured DESC, u.total_terracoins_earned DESC) as rank
FROM users u
LEFT JOIN territories t ON t.owner_id = u.id AND t.expires_at > NOW()
WHERE u.is_active = TRUE
GROUP BY u.id
ORDER BY rank;

CREATE UNIQUE INDEX idx_leaderboard_global_id ON leaderboard_global(id);

-- Refresh function (call this every hour via cron)
CREATE OR REPLACE FUNCTION refresh_leaderboards()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_global;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to check territory overlaps
CREATE OR REPLACE FUNCTION check_territory_overlaps(
    new_polygon GEOMETRY,
    new_owner_id UUID,
    capture_mode VARCHAR(10)
)
RETURNS TABLE (
    territory_id UUID,
    owner_id UUID,
    owner_username VARCHAR,
    overlap_area_km2 DECIMAL,
    overlap_percentage DECIMAL,
    shield_hp INTEGER,
    expires_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.owner_id,
        u.username,
        ST_Area(ST_Intersection(t.geometry, new_polygon)::geography) / 1000000.0 AS overlap_area_km2,
        (ST_Area(ST_Intersection(t.geometry, new_polygon)) / ST_Area(new_polygon)) * 100 AS overlap_percentage,
        t.shield_hp,
        t.expires_at
    FROM territories t
    JOIN users u ON t.owner_id = u.id
    WHERE 
        t.mode = capture_mode
        AND t.owner_id != new_owner_id
        AND t.expires_at > NOW()
        AND ST_Intersects(t.geometry, new_polygon)
    ORDER BY overlap_percentage DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate rent income
CREATE OR REPLACE FUNCTION calculate_rent_income(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    total_rent INTEGER := 0;
    territory RECORD;
BEGIN
    FOR territory IN 
        SELECT area_km2, shield_hp 
        FROM territories 
        WHERE owner_id = user_uuid AND expires_at > NOW()
    LOOP
        total_rent := total_rent + FLOOR((territory.area_km2 * 10) + (territory.shield_hp * 0.2));
    END LOOP;
    
    RETURN total_rent;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update user stats on activity insert
CREATE OR REPLACE FUNCTION update_user_stats_on_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users
    SET 
        total_distance_m = total_distance_m + NEW.distance_m,
        total_activities = total_activities + 1,
        last_activity_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_user_stats
    AFTER INSERT ON activities
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats_on_activity();

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_territories_updated_at BEFORE UPDATE ON territories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INITIAL DATA (Sample Achievements)
-- ============================================================================

INSERT INTO achievements (code, name, description, tier, reward_tc, unlock_criteria) VALUES
('first_capture', 'First Conquest', 'Capture your first territory', 'bronze', 500, '{"territories_captured": 1}'),
('speed_demon', 'Speed Demon', 'Run at 18+ km/h for 5km', 'silver', 1000, '{"avg_speed_kmh": 18, "distance_m": 5000}'),
('marathon_warrior', 'Marathon Warrior', 'Complete a 42.2km activity', 'gold', 5000, '{"distance_m": 42200}'),
('territory_king', 'Territory King', 'Hold 10 territories simultaneously', 'gold', 10000, '{"territories_held": 10}'),
('defender', 'The Defender', 'Successfully defend 5 territories', 'silver', 2000, '{"successful_defenses": 5}'),
('streak_master', 'Streak Master', 'Maintain a 30-day streak', 'platinum', 15000, '{"streak_days": 30}'),
('team_player', 'Team Player', 'Complete 10 team relay captures', 'gold', 5000, '{"team_captures": 10}'),
('coin_collector', 'Coin Collector', 'Earn 100,000 TerraCoins', 'platinum', 0, '{"total_terracoins_earned": 100000}');

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Full-text search on territories
CREATE INDEX idx_territories_name_trgm ON territories USING gin(name gin_trgm_ops);

-- Composite indexes for common queries
CREATE INDEX idx_activities_user_time ON activities(user_id, start_time DESC);
CREATE INDEX idx_territories_owner_expires ON territories(owner_id, expires_at);
CREATE INDEX idx_vault_user_type ON vault_transactions(user_id, transaction_type, created_at DESC);

-- ============================================================================
-- GRANTS (Adjust based on your user setup)
-- ============================================================================

-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO terrarun_api;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO terrarun_api;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO terrarun_api;

-- ============================================================================
-- SCHEMA VERSION
-- ============================================================================

CREATE TABLE schema_version (
    version INTEGER PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT NOW(),
    description TEXT
);

INSERT INTO schema_version (version, description) VALUES
(1, 'Initial schema with core tables, PostGIS support, and game mechanics');

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================