import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATABASE_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../data/auction.db');

// Ensure data directory exists
const dataDir = path.dirname(DATABASE_PATH);
if (!fs.existsSync(dataDir)) {
  console.log(`📁 Creating data directory: ${dataDir}`);
  fs.mkdirSync(dataDir, { recursive: true });
}

console.log(`📂 Database path: ${DATABASE_PATH}`);

// Initialize SQLite database
export const db = new Database(DATABASE_PATH);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Initialize database schema
export function initializeDatabase() {
  // Create bids table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bids (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paddle_number TEXT NOT NULL,
      amount REAL NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for better query performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_bids_timestamp ON bids(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_bids_paddle ON bids(paddle_number);
  `);

  // Create settings table (single row)
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      starting_total REAL DEFAULT 0,
      goal_amount REAL DEFAULT NULL,
      theme_name TEXT DEFAULT 'classic',
      theme_primary_color TEXT DEFAULT '#2563eb',
      theme_secondary_color TEXT DEFAULT '#3b82f6',
      theme_background_type TEXT DEFAULT 'solid',
      theme_background_value TEXT DEFAULT '#ffffff',
      theme_progress_bar_gradient TEXT DEFAULT 'linear-gradient(90deg, #10b981, #34d399, #6ee7b7)',
      logo_path TEXT DEFAULT NULL,
      show_last_bid INTEGER DEFAULT 1,
      donation_levels TEXT DEFAULT '[]',
      current_donation_level REAL DEFAULT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migration: Add donation_levels and current_donation_level columns if they don't exist
  const tableInfo = db.prepare("PRAGMA table_info(settings)").all() as Array<{ name: string }>;
  const columnNames = tableInfo.map(col => col.name);

  if (!columnNames.includes('donation_levels')) {
    console.log('🔄 Adding donation_levels column to settings table');
    db.exec(`ALTER TABLE settings ADD COLUMN donation_levels TEXT DEFAULT '[]'`);
  }

  if (!columnNames.includes('current_donation_level')) {
    console.log('🔄 Adding current_donation_level column to settings table');
    db.exec(`ALTER TABLE settings ADD COLUMN current_donation_level REAL DEFAULT NULL`);
  }

  if (!columnNames.includes('theme_progress_bar_gradient')) {
    console.log('🔄 Adding theme_progress_bar_gradient column to settings table');
    db.exec(`ALTER TABLE settings ADD COLUMN theme_progress_bar_gradient TEXT DEFAULT 'linear-gradient(90deg, #10b981, #34d399, #6ee7b7)'`);
  }

  if (!columnNames.includes('goal_reached_enabled')) {
    console.log('🔄 Adding goal_reached_enabled column to settings table');
    db.exec(`ALTER TABLE settings ADD COLUMN goal_reached_enabled INTEGER DEFAULT 0`);
  }

  if (!columnNames.includes('goal_reached_manual_total')) {
    console.log('🔄 Adding goal_reached_manual_total column to settings table');
    db.exec(`ALTER TABLE settings ADD COLUMN goal_reached_manual_total REAL DEFAULT NULL`);
  }

  if (!columnNames.includes('goal_reached_message')) {
    console.log('🔄 Adding goal_reached_message column to settings table');
    db.exec(`ALTER TABLE settings ADD COLUMN goal_reached_message TEXT DEFAULT NULL`);
  }

  if (!columnNames.includes('custom_background_path')) {
    console.log('🔄 Adding custom_background_path column to settings table');
    db.exec(`ALTER TABLE settings ADD COLUMN custom_background_path TEXT DEFAULT NULL`);
  }

  if (!columnNames.includes('custom_primary_color')) {
    console.log('🔄 Adding custom_primary_color column to settings table');
    db.exec(`ALTER TABLE settings ADD COLUMN custom_primary_color TEXT DEFAULT '#2596be'`);
  }

  if (!columnNames.includes('custom_secondary_color')) {
    console.log('🔄 Adding custom_secondary_color column to settings table');
    db.exec(`ALTER TABLE settings ADD COLUMN custom_secondary_color TEXT DEFAULT '#2596be'`);
  }

  if (!columnNames.includes('custom_color_preset')) {
    console.log('🔄 Adding custom_color_preset column to settings table');
    db.exec(`ALTER TABLE settings ADD COLUMN custom_color_preset TEXT DEFAULT NULL`);
  }

  // Insert default settings if not exists
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };
  if (settingsCount.count === 0) {
    db.prepare(`
      INSERT INTO settings (id, starting_total, goal_amount)
      VALUES (1, 0, NULL)
    `).run();
  }

  // Create metadata table for app state
  db.exec(`
    CREATE TABLE IF NOT EXISTS metadata (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Initialize current_total in metadata if not exists
  const currentTotalExists = db.prepare('SELECT value FROM metadata WHERE key = ?').get('current_total');
  if (!currentTotalExists) {
    db.prepare('INSERT INTO metadata (key, value) VALUES (?, ?)').run('current_total', '0');
  }

  console.log('✅ Database initialized successfully');
}

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  console.log('Database connection closed');
  process.exit(0);
});

process.on('SIGTERM', () => {
  db.close();
  console.log('Database connection closed');
  process.exit(0);
});
