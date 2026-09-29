import type { OrbColor } from '@/game/engine/types';

/**
 * Pixel Arcadia palette. Dark, near-black space ground with high-contrast luminous
 * pixel/charge colors. One source of truth for the Skia field and the RN HUD.
 */
export const palette = {
  /** Page background, darkest. */
  void: '#05060A',
  /** Slightly lifted panel background. */
  abyss: '#0B0E16',
  /** Card / tray surface. */
  surface: '#141926',
  surfaceBorder: '#232A3D',

  textPrimary: '#EEF1F8',
  textSecondary: '#9AA3B8',
  textFaint: '#5A6379',

  core: '#F4F7FF',
  coreGlow: '#8FB4FF',

  ringGuide: '#1B2233',

  success: '#5BE0B0',
  danger: '#FF5C7A',
  warning: '#FFC24B',
} as const;

/**
 * Primary fill for each of the 44 gameplay colors (pixels and charges), in
 * registry order (`ORB_COLOR_IDS`). Color Assist marks (theme/colorAssist.ts)
 * give every one of these a unique non-color identifier.
 */
export const orbColors: Record<OrbColor, string> = {
  white: '#EEF3FF',
  yellow: '#FFD23F',
  gold: '#F2A93B',
  orange: '#FF8A3C',
  red: '#FF4D4D',
  coral: '#FF6F7D',
  pink: '#FF7BC5',
  magenta: '#E85CD8',
  purple: '#B07CFF',
  indigo: '#6E6BF0',
  blue: '#3E7BFF',
  cyan: '#3BE1F0',
  teal: '#2FD3B4',
  green: '#3FDD9B',
  lime: '#9BE84A',
  // World 6 landmark extension.
  sand: '#E4CB98',
  brown: '#A0623A',
  stone: '#8E97A8',
  forest: '#2F8A57',
  maroon: '#B03A52',
  navy: '#244A73',
  seafoam: '#B8E8C6',
  slate: '#4F7282',
  ivory: '#FFF0C2',
  ice: '#AAD6FF',
  amethyst: '#793F98',
  olive: '#8C9A2B',
  umber: '#5E3B25',
  lavender: '#CDB6F7',
  blush: '#F7B8C8',
  bronze: '#9C7A3C',
  ultramarine: '#3A2FD6',
  pine: '#1E5A45',
  mauve: '#A5708F',
  garnet: '#8E1B1B',
  verdigris: '#1B8C8C',
  // World 18 / World 19 / World 20 extensions.
  cerulean: '#2FA0E0',
  graphite: '#555A66',
  sage: '#94A887',
  // World 22 / World 23 extensions.
  plum: '#5A2248',
  rose: '#E0457B',
  silver: '#BEBEBA',
  moss: '#5F6418',
  ash: '#7B786E',
};

/**
 * Lighter glow/halo tint for each color. This is also the light rim on pixels
 * (`pixelMaterial().rim`) and the border on tunnel / Holding Pal chips, so the
 * low-contrast bodies (brown, maroon) get deliberately pale tints to keep their
 * edge readable against the dark board.
 */
export const orbGlow: Record<OrbColor, string> = {
  white: '#FFFFFF',
  yellow: '#FFE79A',
  gold: '#FFCE8A',
  orange: '#FFC199',
  red: '#FF9E9E',
  coral: '#FFB0B8',
  pink: '#FFB8DE',
  magenta: '#F6ACEE',
  purple: '#D6BEFF',
  indigo: '#B6B4FF',
  blue: '#8FB4FF',
  cyan: '#9DF0F8',
  teal: '#9BEEDD',
  green: '#93F0CC',
  lime: '#D0F79E',
  sand: '#F7EBD0',
  brown: '#E2B48F',
  stone: '#D0D6E2',
  forest: '#8FD8AE',
  maroon: '#F0A2B2',
  navy: '#A8C8E8',
  seafoam: '#E6FFF1',
  slate: '#BDD5DE',
  ivory: '#FFFFEA',
  ice: '#E7F5FF',
  amethyst: '#D5ADF0',
  olive: '#CBD19F',
  umber: '#B6A69C',
  lavender: '#E8DEFB',
  blush: '#FBDFE6',
  bronze: '#D2C3A7',
  ultramarine: '#A6A1EC',
  pine: '#99B4AB',
  mauve: '#D6BECC',
  garnet: '#CC9898',
  verdigris: '#98CBCB',
  cerulean: '#A1D4F1',
  graphite: '#B2B4BA',
  sage: '#CED7C9',
  plum: '#B49BAC',
  rose: '#F1ABC3',
  silver: '#E2E2DE',
  moss: '#C4B464',
  ash: '#B4B4A8',
};

/** Human-facing color name for the HUD / accessibility labels. */
export const orbLabel: Record<OrbColor, string> = {
  white: 'WHITE',
  yellow: 'YELLOW',
  gold: 'GOLD',
  orange: 'ORANGE',
  red: 'RED',
  coral: 'CORAL',
  pink: 'PINK',
  magenta: 'MAGENTA',
  purple: 'PURPLE',
  indigo: 'INDIGO',
  blue: 'BLUE',
  cyan: 'CYAN',
  teal: 'TEAL',
  green: 'GREEN',
  lime: 'LIME',
  sand: 'SAND',
  brown: 'BROWN',
  stone: 'STONE',
  forest: 'FOREST',
  maroon: 'MAROON',
  navy: 'NAVY',
  seafoam: 'SEAFOAM',
  slate: 'SLATE',
  ivory: 'IVORY',
  ice: 'ICE',
  amethyst: 'AMETHYST',
  olive: 'OLIVE',
  umber: 'UMBER',
  lavender: 'LAVENDER',
  blush: 'BLUSH',
  bronze: 'BRONZE',
  ultramarine: 'ULTRAMARINE',
  pine: 'PINE',
  mauve: 'MAUVE',
  garnet: 'GARNET',
  verdigris: 'VERDIGRIS',
  cerulean: 'CERULEAN',
  graphite: 'GRAPHITE',
  sage: 'SAGE',
  plum: 'PLUM',
  rose: 'ROSE',
  silver: 'SILVER',
  moss: 'MOSS',
  ash: 'ASH',
};
