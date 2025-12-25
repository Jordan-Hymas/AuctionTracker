export interface Theme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundType: 'solid' | 'gradient' | 'image';
  backgroundValue: string;
  progressBarGradient: string;
}

export const THEMES: Record<string, Theme> = {
  classic: {
    name: 'Classic Blue',
    primaryColor: '#2563eb',
    secondaryColor: '#3b82f6',
    backgroundType: 'gradient',
    backgroundValue: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    progressBarGradient: 'linear-gradient(90deg, #2563eb, #3b82f6, #60a5fa)',
  },
  elegant: {
    name: 'Elegant Purple',
    primaryColor: '#7c3aed',
    secondaryColor: '#a78bfa',
    backgroundType: 'gradient',
    backgroundValue: 'linear-gradient(135deg, #5b21b6 0%, #a78bfa 100%)',
    progressBarGradient: 'linear-gradient(90deg, #7c3aed, #a78bfa, #c4b5fd)',
  },
  vibrant: {
    name: 'Vibrant Rainbow',
    primaryColor: '#ec4899',
    secondaryColor: '#f59e0b',
    backgroundType: 'gradient',
    backgroundValue: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 50%, #10b981 100%)',
    progressBarGradient: 'linear-gradient(90deg, #ec4899, #f59e0b, #10b981)',
  },
  dark: {
    name: 'Dark Mode',
    primaryColor: '#10b981',
    secondaryColor: '#34d399',
    backgroundType: 'solid',
    backgroundValue: '#111827',
    progressBarGradient: 'linear-gradient(90deg, #10b981, #34d399, #6ee7b7)',
  },
  boysGirlsClub: {
    name: 'Boys & Girls Club',
    primaryColor: '#0085CA',
    secondaryColor: '#FFFFFF',
    backgroundType: 'gradient',
    backgroundValue: 'linear-gradient(135deg, #D6EAF8 0%, #85C1E9 25%, #5DADE2 50%, #3498DB 75%, #D6EAF8 100%)',
    progressBarGradient: 'linear-gradient(90deg, #0085CA, #00A8E8, #FFFFFF)',
  },
};
