export interface ThemeConfig {
  primary: string;
  secondary: string;
  primaryForeground: string;
  ring: string;
}

export const THEME_PRESETS: Record<string, ThemeConfig> = {
  indigo: {
    primary: "oklch(0.55 0.20 280)",
    secondary: "oklch(0.65 0.20 330)", // Vibrant Rose-Pink (Split-Complementary accent)
    primaryForeground: "oklch(0.99 0.005 240)",
    ring: "oklch(0.65 0.18 280)",
  },
  emerald: {
    primary: "oklch(0.60 0.18 140)",
    secondary: "oklch(0.65 0.18 200)", // Vibrant Sky-Blue/Cyan (Cool Analogous-High-Contrast)
    primaryForeground: "oklch(0.99 0.005 140)",
    ring: "oklch(0.65 0.15 140)",
  },
  amber: {
    primary: "oklch(0.70 0.18 75)",
    secondary: "oklch(0.60 0.22 15)", // Vibrant Flame-Red (Warm Energy)
    primaryForeground: "oklch(0.12 0.015 75)",
    ring: "oklch(0.70 0.15 75)",
  },
  rose: {
    primary: "oklch(0.60 0.20 5)",
    secondary: "oklch(0.55 0.20 280)", // Vibrant Indigo (Rich Classic Contrast)
    primaryForeground: "oklch(0.99 0.005 5)",
    ring: "oklch(0.65 0.18 5)",
  },
  cyan: {
    primary: "oklch(0.65 0.18 195)",
    secondary: "oklch(0.60 0.20 270)", // Vibrant Violet-Purple (Neon Cyberpunk vibe)
    primaryForeground: "oklch(0.12 0.015 195)",
    ring: "oklch(0.65 0.15 195)",
  },
};

export function getContrastColor(hex: string): string {
  const color = hex.replace("#", "");
  const r = parseInt(color.substring(0, 2), 16) || 0;
  const g = parseInt(color.substring(2, 4), 16) || 0;
  const b = parseInt(color.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? "#0f172a" : "#ffffff"; // Slate-900 or White
}

export function getSecondaryColor(hex: string): string {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;

  // Convert RGB to HSL
  const rNormal = r / 255;
  const gNormal = g / 255;
  const bNormal = b / 255;
  const max = Math.max(rNormal, gNormal, bNormal);
  const min = Math.min(rNormal, gNormal, bNormal);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNormal: h = (gNormal - bNormal) / d + (gNormal < bNormal ? 6 : 0); break;
      case gNormal: h = (bNormal - rNormal) / d + 2; break;
      case bNormal: h = (rNormal - gNormal) / d + 4; break;
    }
    h /= 6;
  }

  // Shift hue by +60 degrees (60/360 = 0.167)
  // According to color theory, a 60-degree (triadic/analogous-vibrant) shift creates a high-contrast,
  // exciting secondary accent that makes beautiful, clean gradients without crossing into muddy colors.
  h = (h + 0.167) % 1;
  s = Math.min(1, s * 1.15); // enhance saturation slightly for secondary pop

  // Convert HSL back to RGB
  let rOut, gOut, bOut;
  if (s === 0) {
    rOut = gOut = bOut = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    rOut = hue2rgb(p, q, h + 1/3);
    gOut = hue2rgb(p, q, h);
    bOut = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (x: number) => {
    const hexVal = Math.round(x * 255).toString(16);
    return hexVal.length === 1 ? "0" + hexVal : hexVal;
  };

  return `#${toHex(rOut)}${toHex(gOut)}${toHex(bOut)}`;
}
