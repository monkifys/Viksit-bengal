/**
 * WCAG 2.2 AA Contrast Checker Utility
 * Calculates exact relative luminance and contrast ratios based on W3C specification:
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */

function hexToRgb(hex) {
  let cleaned = hex.replace('#', '').trim();
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleaned, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function channelToLinear(channelValue) {
  const sRGB = channelValue / 255;
  return sRGB <= 0.04045
    ? sRGB / 12.92
    : Math.pow((sRGB + 0.055) / 1.055, 2.4);
}

export function getRelativeLuminance(hexOrRgb) {
  const rgb = typeof hexOrRgb === 'string' ? hexToRgb(hexOrRgb) : hexOrRgb;
  const r = channelToLinear(rgb.r);
  const g = channelToLinear(rgb.g);
  const b = channelToLinear(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function calculateContrastRatio(color1, color2) {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  return Number(ratio.toFixed(2));
}

export function evaluateWcagCompliance(textColor, backgroundColor) {
  const ratio = calculateContrastRatio(textColor, backgroundColor);
  return {
    ratio,
    passesNormalTextAA: ratio >= 4.5,
    passesLargeTextAA: ratio >= 3.0,
    passesUIComponentsAA: ratio >= 3.0,
    passesNormalTextAAA: ratio >= 7.0,
    textColor,
    backgroundColor
  };
}
