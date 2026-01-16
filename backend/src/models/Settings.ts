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
}
