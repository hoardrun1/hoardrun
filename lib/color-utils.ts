/**
 * Color utility functions for ensuring proper contrast and accessibility
 */

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h * 6) % 2 - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 1/6) {
    r = c; g = x; b = 0;
  } else if (1/6 <= h && h < 1/3) {
    r = x; g = c; b = 0;
  } else if (1/3 <= h && h < 1/2) {
    r = 0; g = c; b = x;
  } else if (1/2 <= h && h < 2/3) {
    r = 0; g = x; b = c;
  } else if (2/3 <= h && h < 5/6) {
    r = x; g = 0; b = c;
  } else if (5/6 <= h && h < 1) {
    r = c; g = 0; b = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}

/**
 * Calculate relative luminance of a color
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: [number, number, number], color2: [number, number, number]): number {
  const lum1 = getLuminance(...color1);
  const lum2 = getLuminance(...color2);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if contrast ratio meets WCAG standards
 */
export function meetsContrastStandard(ratio: number, level: 'AA' | 'AAA' = 'AA'): boolean {
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Parse HSL string and convert to RGB
 */
export function parseHslToRgb(hslString: string): [number, number, number] | null {
  const match = hslString.match(/hsl\((\d+)\s+(\d+)%\s+(\d+)%\)/);
  if (!match) return null;
  
  const [, h, s, l] = match.map(Number);
  return hslToRgb(h, s, l);
}

/**
 * Validate color combination for accessibility
 */
export function validateColorCombination(
  foreground: string, 
  background: string, 
  level: 'AA' | 'AAA' = 'AA'
): { isValid: boolean; ratio: number; recommendation?: string } {
  const fgRgb = parseHslToRgb(foreground);
  const bgRgb = parseHslToRgb(background);
  
  if (!fgRgb || !bgRgb) {
    return { isValid: false, ratio: 0, recommendation: 'Invalid color format' };
  }
  
  const ratio = getContrastRatio(fgRgb, bgRgb);
  const isValid = meetsContrastStandard(ratio, level);
  
  let recommendation: string | undefined;
  if (!isValid) {
    if (ratio < 3) {
      recommendation = 'Very poor contrast. Consider using completely different colors.';
    } else if (ratio < 4.5) {
      recommendation = 'Poor contrast. Increase the difference between foreground and background.';
    } else {
      recommendation = 'Contrast is close but not quite meeting AAA standards.';
    }
  }
  
  return { isValid, ratio, recommendation };
}

/**
 * Semantic color combinations for the application
 */
export const SEMANTIC_COLORS = {
  light: {
    'content-primary': 'hsl(0 0% 0%)',
    'content-secondary': 'hsl(0 0% 25%)',
    'content-tertiary': 'hsl(0 0% 45%)',
    'content-inverse': 'hsl(0 0% 100%)',
    'background': 'hsl(0 0% 100%)',
    'surface': 'hsl(0 0% 98%)',
  },
  dark: {
    'content-primary': 'hsl(0 0% 97%)',
    'content-secondary': 'hsl(0 0% 85%)',
    'content-tertiary': 'hsl(0 0% 75%)',
    'content-inverse': 'hsl(0 0% 4%)',
    'background': 'hsl(0 0% 4%)',
    'surface': 'hsl(0 0% 10%)',
  }
} as const;

/**
 * Validate all semantic color combinations
 */
export function validateSemanticColors(): Record<string, any> {
  const results: Record<string, any> = {};
  
  Object.entries(SEMANTIC_COLORS).forEach(([theme, colors]) => {
    results[theme] = {};
    
    // Test content colors against backgrounds
    const backgrounds = ['background', 'surface'];
    const contents = ['content-primary', 'content-secondary', 'content-tertiary'];
    
    backgrounds.forEach(bg => {
      contents.forEach(content => {
        const key = `${content}-on-${bg}`;
        results[theme][key] = validateColorCombination(
          colors[content as keyof typeof colors],
          colors[bg as keyof typeof colors]
        );
      });
    });
  });
  
  return results;
}

/**
 * Get semantic color class for text based on theme
 */
export function getSemanticTextColor(level: 'primary' | 'secondary' | 'tertiary' | 'muted' = 'primary'): string {
  switch (level) {
    case 'primary':
      return 'text-content-primary';
    case 'secondary':
      return 'text-content-secondary';
    case 'tertiary':
      return 'text-content-tertiary';
    case 'muted':
      return 'text-muted-foreground';
    default:
      return 'text-foreground';
  }
}

/**
 * Get semantic color class for status indicators
 */
export function getStatusColor(status: 'success' | 'warning' | 'error' | 'info'): string {
  switch (status) {
    case 'success':
      return 'text-status-success';
    case 'warning':
      return 'text-status-warning';
    case 'error':
      return 'text-status-error';
    case 'info':
      return 'text-status-info';
    default:
      return 'text-foreground';
  }
}

/**
 * Get semantic background color class for status indicators
 */
export function getStatusBackgroundColor(status: 'success' | 'warning' | 'error' | 'info'): string {
  switch (status) {
    case 'success':
      return 'bg-success-light';
    case 'warning':
      return 'bg-warning-light';
    case 'error':
      return 'bg-red-100 dark:bg-red-900/20';
    case 'info':
      return 'bg-info-light';
    default:
      return 'bg-muted';
  }
}

/**
 * Check if current theme is dark mode
 */
export function isDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

/**
 * Get appropriate text color for given background
 */
export function getContrastingTextColor(backgroundColor: string): string {
  const rgb = parseHslToRgb(backgroundColor);
  if (!rgb) return 'text-foreground';
  
  const luminance = getLuminance(...rgb);
  return luminance > 0.5 ? 'text-gray-900' : 'text-white';
}
