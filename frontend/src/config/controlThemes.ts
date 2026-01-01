import { ControlTheme } from '../types/controlTheme';

export const lightTheme: ControlTheme = {
  mode: 'light',
  colors: {
    // Backgrounds
    pageBg: '#f8fafc',
    cardBg: '#ffffff',
    cardBorder: '#e2e8f0',

    // Text
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',

    // Brand colors - blue (Professional slate-blue)
    blue: '#475569',
    blueLight: '#64748b',
    blueLighter: '#f1f5f9',
    blueDark: '#334155',

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
    shadow: 'rgba(15, 23, 42, 0.08)',
    shadowMd: 'rgba(15, 23, 42, 0.12)',
    shadowLg: 'rgba(15, 23, 42, 0.16)',
    hover: '#f8fafc',
  },
};

export const darkTheme: ControlTheme = {
  mode: 'dark',
  colors: {
    // Backgrounds
    pageBg: '#0f172a',
    cardBg: '#1e293b',
    cardBorder: '#334155',

    // Text
    textPrimary: '#f1f5f9',
    textSecondary: '#cbd5e1',
    textMuted: '#64748b',

    // Brand colors - blue (Professional slate-blue)
    blue: '#64748b',
    blueLight: '#94a3b8',
    blueLighter: 'rgba(100, 116, 139, 0.1)',
    blueDark: '#475569',

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
    inputBorder: '#475569',
    inputBg: '#334155',
    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowMd: 'rgba(0, 0, 0, 0.4)',
    shadowLg: 'rgba(0, 0, 0, 0.5)',
    hover: '#293548',
  },
};

export const getTheme = (mode: 'light' | 'dark'): ControlTheme => {
  return mode === 'dark' ? darkTheme : lightTheme;
};
