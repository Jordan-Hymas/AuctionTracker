import { getSettings, updateSettings, updateLogo } from '../database/queries';
import { Settings, UpdateSettings } from '../models/Settings';

export class SettingsService {
  static async getSettings(): Promise<Settings> {
    return getSettings();
  }

  static async updateSettings(updates: UpdateSettings): Promise<Settings> {
    // Validate goal amount if provided
    if (updates.goalAmount !== undefined && updates.goalAmount !== null) {
      const settings = getSettings();
      const startingTotal = updates.startingTotal !== undefined ? updates.startingTotal : settings.startingTotal;

      if (updates.goalAmount <= startingTotal) {
        throw new Error('Goal amount must be greater than starting total');
      }
    }

    return updateSettings(updates);
  }

  static async updateLogo(logoPath: string | null): Promise<Settings> {
    return updateLogo(logoPath);
  }
}
