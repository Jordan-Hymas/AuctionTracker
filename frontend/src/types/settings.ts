export interface Settings {
  id: number;
  startingTotal: number;
  goalAmount: number | null;
  themeName: string;
  themePrimaryColor: string;
  themeSecondaryColor: string;
  themeBackgroundType: 'solid' | 'gradient' | 'image';
  themeBackgroundValue: string;
  themeProgressBarGradient: string;
  logoPath: string | null;
  showLastBid: boolean;
  donationLevels: number[];
  currentDonationLevel: number | null;
  goalReachedEnabled: boolean;
  goalReachedManualTotal: number | null;
  goalReachedMessage: string | null;
  goalReachedBackgroundPath: string | null;
  customBackgroundPath: string | null;
  customPrimaryColor: string;
  customSecondaryColor: string;
  customColorPreset: string | null;
  paddleDigits: number;
  paddleAnimation: string;
  progressBarTheme: string;
  updatedAt: string;
}

export interface UpdateSettings {
  startingTotal?: number;
  goalAmount?: number | null;
  themeName?: string;
  themePrimaryColor?: string;
  themeSecondaryColor?: string;
  themeBackgroundType?: 'solid' | 'gradient' | 'image';
  themeBackgroundValue?: string;
  themeProgressBarGradient?: string;
  logoPath?: string | null;
  showLastBid?: boolean;
  donationLevels?: number[];
  currentDonationLevel?: number | null;
  goalReachedEnabled?: boolean;
  goalReachedManualTotal?: number | null;
  goalReachedMessage?: string | null;
  goalReachedBackgroundPath?: string | null;
  customBackgroundPath?: string | null;
  customPrimaryColor?: string;
  customSecondaryColor?: string;
  customColorPreset?: string | null;
  paddleDigits?: number;
  paddleAnimation?: string;
  progressBarTheme?: string;
}
