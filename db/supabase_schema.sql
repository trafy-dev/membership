-- ============================================================
-- SUPABASE / POSTGRESQL SCHEMA FOR MEMBERSHIP SYSTEM
-- Copy and run this directly in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS members (
    id BIGSERIAL PRIMARY KEY,
    member_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    father_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    address TEXT,
    district TEXT,
    state TEXT,
    contact_number TEXT,
    blood_group TEXT,
    profession TEXT,
    is_student BOOLEAN DEFAULT false,
    course TEXT,
    year TEXT,
    institution_name TEXT,
    city TEXT,
    profile_picture TEXT,
    disclaimer_accepted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Trigger function to auto-update updated_at on record changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it already exists to avoid errors on rerun
DROP TRIGGER IF EXISTS update_member_timestamp ON members;

-- Create trigger
CREATE TRIGGER update_member_timestamp
BEFORE UPDATE ON members
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
