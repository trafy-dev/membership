const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'membership.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let db;

function getDatabase() {
    if (!db) {
        db = new Database(DB_PATH);
        // Enable WAL mode for better concurrent read performance
        db.pragma('journal_mode = WAL');
        db.pragma('foreign_keys = ON');

        // Run schema on first boot
        const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
        db.exec(schema);

        console.log('[DB] SQLite database initialized at:', DB_PATH);
    }
    return db;
}

/**
 * Generate the next unique member ID in format MEM-XXXXX
 */
function generateMemberId() {
    const db = getDatabase();
    const row = db.prepare('SELECT COUNT(*) as count FROM members').get();
    const nextNum = (row.count + 1).toString().padStart(5, '0');
    return `MEM-${nextNum}`;
}

module.exports = { getDatabase, generateMemberId };
