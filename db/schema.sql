CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    is_student INTEGER DEFAULT 0,
    course TEXT,
    year TEXT,
    institution_name TEXT,
    city TEXT,
    profile_picture TEXT,
    disclaimer_accepted INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to auto-update updated_at on row changes
CREATE TRIGGER IF NOT EXISTS update_member_timestamp
AFTER UPDATE ON members
FOR EACH ROW
BEGIN
    UPDATE members SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
