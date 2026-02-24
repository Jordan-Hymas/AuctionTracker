import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';

const DATABASE_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../data/auction.db');

// Ensure data directory exists
const dataDir = path.dirname(DATABASE_PATH);
if (!fs.existsSync(dataDir)) {
  logger.info('Creating data directory', { path: dataDir });
  fs.mkdirSync(dataDir, { recursive: true });
}

logger.info('Database path', { path: DATABASE_PATH });

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
      goal_reached_background_path TEXT DEFAULT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migration: Add donation_levels and current_donation_level columns if they don't exist
  const tableInfo = db.prepare("PRAGMA table_info(settings)").all() as Array<{ name: string }>;
  const columnNames = tableInfo.map(col => col.name);

  const runMigration = (column: string, sql: string) => {
    if (!columnNames.includes(column)) {
      logger.info('Migration: adding column', { column });
      db.exec(sql);
    } else {
      logger.info('Migration: column already present — skipped', { column });
    }
  };

  runMigration('donation_levels', `ALTER TABLE settings ADD COLUMN donation_levels TEXT DEFAULT '[]'`);
  runMigration('current_donation_level', `ALTER TABLE settings ADD COLUMN current_donation_level REAL DEFAULT NULL`);
  runMigration('theme_progress_bar_gradient', `ALTER TABLE settings ADD COLUMN theme_progress_bar_gradient TEXT DEFAULT 'linear-gradient(90deg, #10b981, #34d399, #6ee7b7)'`);
  runMigration('goal_reached_enabled', `ALTER TABLE settings ADD COLUMN goal_reached_enabled INTEGER DEFAULT 0`);
  runMigration('goal_reached_manual_total', `ALTER TABLE settings ADD COLUMN goal_reached_manual_total REAL DEFAULT NULL`);
  runMigration('goal_reached_message', `ALTER TABLE settings ADD COLUMN goal_reached_message TEXT DEFAULT NULL`);
  runMigration('goal_reached_background_path', `ALTER TABLE settings ADD COLUMN goal_reached_background_path TEXT DEFAULT NULL`);
  runMigration('custom_background_path', `ALTER TABLE settings ADD COLUMN custom_background_path TEXT DEFAULT NULL`);
  runMigration('custom_primary_color', `ALTER TABLE settings ADD COLUMN custom_primary_color TEXT DEFAULT '#2596be'`);
  runMigration('custom_secondary_color', `ALTER TABLE settings ADD COLUMN custom_secondary_color TEXT DEFAULT '#2596be'`);
  runMigration('custom_color_preset', `ALTER TABLE settings ADD COLUMN custom_color_preset TEXT DEFAULT NULL`);
  runMigration('paddle_digits', `ALTER TABLE settings ADD COLUMN paddle_digits INTEGER DEFAULT 3`);
  runMigration('paddle_animation', `ALTER TABLE settings ADD COLUMN paddle_animation TEXT DEFAULT 'spinning'`);
  runMigration('progress_bar_theme', `ALTER TABLE settings ADD COLUMN progress_bar_theme TEXT DEFAULT 'capsule-v2'`);

  // Migrate removed 'capsule' (V1) value to 'capsule-v2'
  db.prepare(`UPDATE settings SET progress_bar_theme = 'capsule-v2' WHERE progress_bar_theme = 'capsule'`).run();

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

  logger.info('Database initialized successfully');
}

// Automatic backup every 5 minutes — safe to run while DB is active
const BACKUP_INTERVAL_MS = 5 * 60 * 1000;
const BACKUP_PATH = DATABASE_PATH + '.backup';

let backupTimer: ReturnType<typeof setInterval> | null = null;

export function startBackupSchedule() {
  if (backupTimer !== null) return;
  backupTimer = setInterval(() => {
    try {
      db.backup(BACKUP_PATH);
      logger.info('Database backup saved', { path: BACKUP_PATH });
    } catch (err) {
      logger.error('Database backup failed', err);
    }
  }, BACKUP_INTERVAL_MS);
  logger.info('Database backup scheduled', { intervalMinutes: BACKUP_INTERVAL_MS / 60000 });
}

export function stopBackupSchedule() {
  if (backupTimer !== null) {
    clearInterval(backupTimer);
    backupTimer = null;
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  logger.info('Database connection closed');
  process.exit(0);
});

process.on('SIGTERM', () => {
  db.close();
  logger.info('Database connection closed');
  process.exit(0);
});
