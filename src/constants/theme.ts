/**
 * Two palettes evoking a duel disk / card sleeve: millennium-gold primary accent,
 * deep duel-monsters purple secondary accent, on either a near-black or parchment base.
 */
const dark = {
  background: '#0B0B12',
  backgroundElement: '#181822',
  backgroundSelected: '#22222F',
  border: '#2E2A3D',
  text: '#F5F1E6',
  textSecondary: '#A9A6B8',
  gold: '#FFC531',
  goldMuted: '#C99A3B',
  purple: '#9354FF',
} as const;

const light = {
  background: '#F5F1E4',
  backgroundElement: '#FFFFFF',
  backgroundSelected: '#EADFC0',
  border: '#D9CBA0',
  text: '#1C1710',
  textSecondary: '#726A55',
  gold: '#D6900A',
  goldMuted: '#C7A84C',
  purple: '#7C3AED',
} as const;

export type ThemeScheme = 'dark' | 'light';
export type ThemeColor = keyof typeof dark;

export const Palettes: Record<ThemeScheme, Record<ThemeColor, string>> = { dark, light };

export const Fonts = {
  display: 'Cinzel_700Bold',
  displaySemi: 'Cinzel_600SemiBold',
  sans: 'normal',
  mono: 'monospace',
};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const MaxContentWidth = 800;

/** Fixed brand color for the app titles ("Duel Album" / "Mazzi"), independent of light/dark theme. */
export const BRAND_RED = '#E5322D';

/** Fixed color for every "Salva" button, independent of light/dark theme. */
export const BRAND_BLUE = '#2EC4F1';
