import { ControlTheme } from '../types/controlTheme';

export const lightTheme: ControlTheme = {
  mode: 'light',
  colors: {
    // Backgrounds
    pageBg: '#f8fafc',
    cardBg: '#ffffff',
    cardBorder: '#e8ecf0',
    widgetBorder: '#94a3b8',

    // Text
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',

    // Brand colors - blue (CTA blue)
    blue: '#2563eb',
    blueLight: '#3b82f6',
    blueLighter: '#eff6ff',
    blueDark: '#1d4ed8',

    // Brand colors - green (Muted teal/forest)
    green: '#0f766e',
    greenLight: '#ccfbf1',
    greenDark: '#115e59',
    greenLighter: '#f0fdfa',

    // Brand colors - purple (Sophisticated indigo)
    purple: '#6366f1',
    purpleLight: '#e0e7ff',
    purpleDark: '#4f46e5',

    // Brand colors - red (Deep burgundy)
    red: '#b91c1c',
    redLight: '#fee2e2',
    redDark: '#991b1b',
    redLighter: '#fef2f2',

    // UI elements
    inputBorder: '#cbd5e1',
    inputBg: '#ffffff',
    shadow: 'rgba(15, 23, 42, 0.06)',
    shadowMd: 'rgba(15, 23, 42, 0.10)',
    shadowLg: 'rgba(15, 23, 42, 0.16)',
    hover: '#f1f5f9',
    accent: '#2563eb',
    cardBgHover: '#f8fafc',
  },
};

export const darkTheme: ControlTheme = {
  mode: 'dark',
  colors: {
    // Backgrounds
    pageBg: '#0d1117',
    cardBg: '#161b22',
    cardBorder: '#21262d',
    widgetBorder: '#3d444d',

    // Text
    textPrimary: '#e6edf3',
    textSecondary: '#8b949e',
    textMuted: '#484f58',

    // Brand colors - blue (Bright readable CTA blue)
    blue: '#388bfd',
    blueLight: '#58a6ff',
    blueLighter: 'rgba(56, 139, 253, 0.1)',
    blueDark: '#1f6feb',

    // Brand colors - green (Muted teal/forest)
    green: '#14b8a6',
    greenLight: 'rgba(20, 184, 166, 0.15)',
    greenDark: '#0f766e',
    greenLighter: 'rgba(20, 184, 166, 0.1)',

    // Brand colors - purple (Sophisticated indigo)
    purple: '#818cf8',
    purpleLight: 'rgba(129, 140, 248, 0.2)',
    purpleDark: '#6366f1',

    // Brand colors - red (Deep burgundy)
    red: '#dc2626',
    redLight: 'rgba(220, 38, 38, 0.15)',
    redDark: '#b91c1c',
    redLighter: 'rgba(220, 38, 38, 0.1)',

    // UI elements
    inputBorder: '#30363d',
    inputBg: '#0d1117',
    shadow: 'rgba(1, 4, 9, 0.4)',
    shadowMd: 'rgba(1, 4, 9, 0.5)',
    shadowLg: 'rgba(1, 4, 9, 0.6)',
    hover: '#1c2128',
    accent: '#388bfd',
    cardBgHover: '#1c2128',
  },
};

export const getTheme = (mode: 'light' | 'dark'): ControlTheme => {
  return mode === 'dark' ? darkTheme : lightTheme;
};
