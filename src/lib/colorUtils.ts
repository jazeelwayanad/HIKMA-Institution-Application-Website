/**
 * Mapping of legacy Tailwind color names to Hex colors.
 */
const legacyColorMap: Record<string, string> = {
  indigo: "#4f46e5",
  amber: "#f59e0b",
  emerald: "#10b981",
  red: "#ef4444",
  blue: "#3b82f6",
  violet: "#8b5cf6",
  fuchsia: "#d946ef",
  rose: "#f43f5e",
  cyan: "#06b6d4",
  teal: "#14b8a6",
};

/**
 * Standardizes a color string to a hex code.
 * If it's already a hex code, returns it.
 * If it's a legacy tailwind color name, returns the mapped hex.
 * Falls back to indigo hex if unknown.
 */
export function getHexColor(colorStr: string): string {
  if (!colorStr) return legacyColorMap.indigo;
  if (colorStr.startsWith("#")) return colorStr;
  return legacyColorMap[colorStr.toLowerCase()] || legacyColorMap.indigo;
}

/**
 * Returns inline styles for a status badge.
 * Background is 15% opacity of the color, text and border are full color.
 */
export function getBadgeStyles(colorStr: string) {
  const hex = getHexColor(colorStr);
  return {
    backgroundColor: `${hex}15`, // 15% opacity hex
    color: hex,
    borderColor: `${hex}40`, // 25% opacity hex for border
  };
}

/**
 * Returns inline styles for a status dot.
 * Background is full color.
 */
export function getDotStyles(colorStr: string) {
  const hex = getHexColor(colorStr);
  return {
    backgroundColor: hex,
  };
}

/**
 * Returns a linear gradient style based on a hex color.
 * Generates a gradient from a slightly lighter version to the base hex.
 */
export function getGradientStyles(colorStr: string) {
  const hex = getHexColor(colorStr);
  // We'll just create a gradient from the base color at 80% opacity to 100% opacity
  return {
    background: `linear-gradient(135deg, ${hex}cc 0%, ${hex} 100%)`,
  };
}
