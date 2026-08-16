-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    class_level VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Activity History Table
CREATE TABLE IF NOT EXISTS activity_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, 
    input_data JSONB NOT NULL,
    generated_content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Saved Content Table
CREATE TABLE IF NOT EXISTS saved_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    history_id UUID REFERENCES activity_history(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    data JSONB NOT NULL,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_activity_history_user_date ON activity_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_history_type ON activity_history(user_id, activity_type);
CREATE INDEX IF NOT EXISTS idx_saved_content_user ON saved_content(user_id, saved_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_content_jsonb ON activity_history USING GIN (generated_content);
