export type ThemeMode = 'light' | 'dark';

export interface ControlTheme {
  mode: ThemeMode;
  colors: {
    // Backgrounds
    pageBg: string;
    cardBg: string;
    cardBorder: string;

    // Text
    textPrimary: string;
    textSecondary: string;
    textMuted: string;

    // Brand colors
    blue: string;
    blueLight: string;
    blueLighter: string;
    blueDark: string;
    green: string;
    greenLight: string;
    greenDark: string;
    greenLighter: string;
    purple: string;
    purpleLight: string;
    purpleDark: string;
    red: string;
    redLight: string;
    redDark: string;
    redLighter: string;

    // UI elements
    inputBorder: string;
    inputBg: string;
    shadow: string;
    shadowMd: string;
    shadowLg: string;
    hover: string;
  };
}
