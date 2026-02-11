export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace('#', '');
  const bigint = parseInt(cleaned, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

export function darkenColor(hex: string, factor: number): string {
  const { r, g, b } = hexToRgb(hex);
  const darken = (c: number) => Math.round(c * (1 - factor));
  return `#${darken(r).toString(16).padStart(2, '0')}${darken(g).toString(16).padStart(2, '0')}${darken(b).toString(16).padStart(2, '0')}`;
}

export function lightenColor(hex: string, factor: number): string {
  const { r, g, b } = hexToRgb(hex);
  const lighten = (c: number) => Math.round(c + (255 - c) * factor);
  return `#${lighten(r).toString(16).padStart(2, '0')}${lighten(g).toString(16).padStart(2, '0')}${lighten(b).toString(16).padStart(2, '0')}`;
}

export function hexToRgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function generateThermometerGradient(baseColor: string): string {
  const dark = darkenColor(baseColor, 0.25);
  const light = lightenColor(baseColor, 0.25);
  return `linear-gradient(to top, ${dark}, ${baseColor}, ${light})`;
}

export function generateProgressBarGradient(baseColor: string): string {
  const dark = darkenColor(baseColor, 0.15);
  const light = lightenColor(baseColor, 0.15);
  const lighter = lightenColor(baseColor, 0.25);
  return `linear-gradient(90deg, ${dark} 0%, ${baseColor} 25%, ${lighter} 50%, ${light} 75%, ${dark} 100%)`;
}
