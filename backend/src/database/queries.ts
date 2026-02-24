import { db } from './db';
import { Bid, NewBid } from '../models/Bid';
import { Settings, UpdateSettings } from '../models/Settings';

// Helper to convert snake_case to camelCase
function snakeToCamel(obj: any): any {
  const result: any = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = obj[key];
  }
  return result;
}

// ==================== BID QUERIES ====================

export function getAllBids(): Bid[] {
  const rows = db.prepare('SELECT * FROM bids ORDER BY timestamp DESC').all();
  return rows.map(snakeToCamel);
}

export function getRecentBids(limit: number = 10): Bid[] {
  const rows = db.prepare('SELECT * FROM bids ORDER BY timestamp DESC LIMIT ?').all(limit);
  return rows.map(snakeToCamel);
}

export function getBidById(id: number): Bid | undefined {
  const row = db.prepare('SELECT * FROM bids WHERE id = ?').get(id);
  return row ? snakeToCamel(row) : undefined;
}

export function getLastBid(): Bid | undefined {
  const row = db.prepare('SELECT * FROM bids ORDER BY id DESC LIMIT 1').get();
  return row ? snakeToCamel(row) : undefined;
}

export function addBid(newBid: NewBid): Bid {
  const result = db.prepare(`
    INSERT INTO bids (paddle_number, amount)
    VALUES (?, ?)
  `).run(newBid.paddleNumber, newBid.amount);

  const insertedBid = getBidById(result.lastInsertRowid as number);
  if (!insertedBid) {
    throw new Error('Failed to retrieve inserted bid');
  }
  return insertedBid;
}

export function deleteBid(id: number): boolean {
  const bid = getBidById(id);
  if (!bid) return false;

  db.prepare('DELETE FROM bids WHERE id = ?').run(id);

  return true;
}

export function deleteLastBid(): Bid | null {
  const lastBid = getLastBid();
  if (!lastBid) return null;

  deleteBid(lastBid.id);
  return lastBid;
}

export function getBidCount(): number {
  const result = db.prepare('SELECT COUNT(*) as count FROM bids').get() as { count: number };
  return result.count;
}

export function getTotalBidAmount(): number {
  const result = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM bids').get() as { total: number };
  return result.total;
}

export function clearAllBids(): void {
  db.prepare('DELETE FROM bids').run();
}

// ==================== SETTINGS QUERIES ====================

export function getSettings(): Settings {
  const row = db.prepare('SELECT * FROM settings WHERE id = 1').get();
  if (!row) {
    // Initialize default settings if not found
    db.prepare(`
      INSERT INTO settings (id, starting_total, goal_amount)
      VALUES (1, 0, NULL)
    `).run();
    return getSettings();
  }
  const settings = snakeToCamel(row);
  settings.showLastBid = Boolean(settings.showLastBid);
  settings.goalReachedEnabled = Boolean(settings.goalReachedEnabled);

  // Parse donation_levels JSON
  try {
    settings.donationLevels = JSON.parse(settings.donationLevels || '[]');
  } catch {
    settings.donationLevels = [];
  }

  return settings;
}

export function updateSettings(updates: UpdateSettings): Settings {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.startingTotal !== undefined) {
    fields.push('starting_total = ?');
    values.push(updates.startingTotal);
  }
  if (updates.goalAmount !== undefined) {
    fields.push('goal_amount = ?');
    values.push(updates.goalAmount);
  }
  if (updates.themeName !== undefined) {
    fields.push('theme_name = ?');
    values.push(updates.themeName);
  }
  if (updates.themePrimaryColor !== undefined) {
    fields.push('theme_primary_color = ?');
    values.push(updates.themePrimaryColor);
  }
  if (updates.themeSecondaryColor !== undefined) {
    fields.push('theme_secondary_color = ?');
    values.push(updates.themeSecondaryColor);
  }
  if (updates.themeBackgroundType !== undefined) {
    fields.push('theme_background_type = ?');
    values.push(updates.themeBackgroundType);
  }
  if (updates.themeBackgroundValue !== undefined) {
    fields.push('theme_background_value = ?');
    values.push(updates.themeBackgroundValue);
  }
  if (updates.themeProgressBarGradient !== undefined) {
    fields.push('theme_progress_bar_gradient = ?');
    values.push(updates.themeProgressBarGradient);
  }
  if (updates.logoPath !== undefined) {
    fields.push('logo_path = ?');
    values.push(updates.logoPath);
  }
  if (updates.showLastBid !== undefined) {
    fields.push('show_last_bid = ?');
    values.push(updates.showLastBid ? 1 : 0);
  }
  if (updates.donationLevels !== undefined) {
    // Sort, remove duplicates, filter out invalid values, and stringify
    const sortedLevels = [...new Set(updates.donationLevels)]
      .filter(level => level > 0)
      .sort((a, b) => a - b);

    fields.push('donation_levels = ?');
    values.push(JSON.stringify(sortedLevels));
  }
  if (updates.currentDonationLevel !== undefined) {
    // Validate that current level exists in donation levels array (or is null)
    if (updates.currentDonationLevel !== null && updates.donationLevels) {
      const sortedLevels = [...new Set(updates.donationLevels)]
        .filter(level => level > 0)
        .sort((a, b) => a - b);

      if (!sortedLevels.includes(updates.currentDonationLevel)) {
        // If current level is not in the array, set to null
        updates.currentDonationLevel = null;
      }
    }

    fields.push('current_donation_level = ?');
    values.push(updates.currentDonationLevel);
  }
  if (updates.goalReachedEnabled !== undefined) {
    fields.push('goal_reached_enabled = ?');
    values.push(updates.goalReachedEnabled ? 1 : 0);
  }
  if (updates.goalReachedManualTotal !== undefined) {
    fields.push('goal_reached_manual_total = ?');
    values.push(updates.goalReachedManualTotal);
  }
  if (updates.goalReachedMessage !== undefined) {
    fields.push('goal_reached_message = ?');
    values.push(updates.goalReachedMessage);
  }
  if (updates.goalReachedBackgroundPath !== undefined) {
    fields.push('goal_reached_background_path = ?');
    values.push(updates.goalReachedBackgroundPath);
  }
  if (updates.customBackgroundPath !== undefined) {
    fields.push('custom_background_path = ?');
    values.push(updates.customBackgroundPath);
  }
  if (updates.customPrimaryColor !== undefined) {
    fields.push('custom_primary_color = ?');
    values.push(updates.customPrimaryColor);
  }
  if (updates.customSecondaryColor !== undefined) {
    fields.push('custom_secondary_color = ?');
    values.push(updates.customSecondaryColor);
  }
  if (updates.customColorPreset !== undefined) {
    fields.push('custom_color_preset = ?');
    values.push(updates.customColorPreset);
  }
  if (updates.paddleDigits !== undefined) {
    fields.push('paddle_digits = ?');
    values.push(updates.paddleDigits);
  }
  if (updates.paddleAnimation !== undefined) {
    fields.push('paddle_animation = ?');
    values.push(updates.paddleAnimation);
  }
  if (updates.progressBarTheme !== undefined) {
    fields.push('progress_bar_theme = ?');
    values.push(updates.progressBarTheme);
  }

  if (fields.length === 0) {
    return getSettings();
  }

  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(1); // WHERE id = 1

  const query = `UPDATE settings SET ${fields.join(', ')} WHERE id = ?`;
  db.prepare(query).run(...values);

  return getSettings();
}

export function updateLogo(logoPath: string | null): Settings {
  return updateSettings({ logoPath });
}

// ==================== METADATA QUERIES ====================

export function getCurrentTotal(): number {
  const settings = getSettings();
  const totalBidAmount = getTotalBidAmount();
  return settings.startingTotal + totalBidAmount;
}

export function updateCurrentTotal(newTotal: number): void {
  db.prepare(`
    UPDATE metadata
    SET value = ?, updated_at = CURRENT_TIMESTAMP
    WHERE key = ?
  `).run(newTotal.toString(), 'current_total');
}

export function getMetadata(key: string): string | null {
  const row = db.prepare('SELECT value FROM metadata WHERE key = ?').get(key) as { value: string } | undefined;
  return row ? row.value : null;
}

export function setMetadata(key: string, value: string): void {
  db.prepare(`
    INSERT OR REPLACE INTO metadata (key, value, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
  `).run(key, value);
}

// ==================== ADMIN QUERIES ====================

export function resetAllData(): void {
  db.prepare('DELETE FROM bids').run();
  // Reset the AUTOINCREMENT sequence so entry #s restart from 1 each session
  db.prepare("DELETE FROM sqlite_sequence WHERE name = 'bids'").run();
  db.prepare('UPDATE metadata SET value = ? WHERE key = ?').run('0', 'current_total');
  db.prepare(`
    UPDATE settings SET
      starting_total = 0,
      goal_amount = NULL,
      logo_path = NULL,
      donation_levels = '[]',
      current_donation_level = NULL,
      goal_reached_background_path = NULL,
      custom_background_path = NULL,
      custom_primary_color = '#2596be',
      custom_secondary_color = '#2596be',
      custom_color_preset = NULL,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `).run();
}
