export interface Theme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundType: 'solid' | 'gradient' | 'image';
  backgroundValue: string;
  progressBarGradient: string;
}

export const THEMES: Record<string, Theme> = {
  boysGirlsClub: {
    name: 'Boys & Girls Club',
    primaryColor: '#2596be',
    secondaryColor: '#2596be',
    backgroundType: 'gradient',
    backgroundValue: 'linear-gradient(135deg, #D6EAF8 0%, #85C1E9 25%, #5DADE2 50%, #3498DB 75%, #D6EAF8 100%)',
    progressBarGradient: 'linear-gradient(90deg, #2596be 0%, #30a5d0 25%, #40b5e0 50%, #30a5d0 75%, #2596be 100%)',
  },
  modern: {
    name: 'NPCE',
    primaryColor: '#1b3664',
    secondaryColor: '#e24725',
    backgroundType: 'gradient',
    backgroundValue: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)',
    progressBarGradient: 'linear-gradient(90deg, #e24725 0%, #ff5a3d 25%, #ff7355 50%, #ff5a3d 75%, #e24725 100%)',
  },
  modernDots: {
    name: 'Modern',
    primaryColor: '#0f172a',
    secondaryColor: '#06b6d4',
    backgroundType: 'gradient',
    backgroundValue: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)',
    progressBarGradient: 'linear-gradient(90deg, #06b6d4 0%, #0ea5e9 50%, #06b6d4 100%)',
  },
  winter: {
    name: 'Winter',
    primaryColor: '#2596be',
    secondaryColor: '#2596be',
    backgroundType: 'gradient',
    backgroundValue: 'linear-gradient(180deg, #e8f4fc 0%, #d4ebf7 20%, #b8dff5 40%, #a8d8f0 60%, #c5e5f7 80%, #daeef9 100%)',
    progressBarGradient: 'linear-gradient(90deg, #2596be 0%, #30a5d0 25%, #40b5e0 50%, #30a5d0 75%, #2596be 100%)',
  },
};
