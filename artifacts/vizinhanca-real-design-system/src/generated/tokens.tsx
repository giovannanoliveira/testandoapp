/* GENERATED FROM tokens.json -- DO NOT EDIT. Run scripts/build-tokens.mjs. */
// Portable design tokens (colors as hex). Web consumes the theme via
// src/index.css; mobile (Expo) and any other platform import this object so the
// whole product shares one source of truth.
export const tokens = {
  "color": {
    "light": {
      "background": "#f7f2ea",
      "foreground": "#2b2b28",
      "border": "#e3ddcf",
      "card": "#ffffff",
      "cardForeground": "#2b2b28",
      "popover": "#ffffff",
      "popoverForeground": "#2b2b28",
      "primary": "#1e4a4f",
      "primaryForeground": "#f7f2ea",
      "secondary": "#8fae8a",
      "secondaryForeground": "#202e27",
      "muted": "#ede8df",
      "mutedForeground": "#6b6862",
      "accent": "#c8dcbe",
      "accentForeground": "#1e4a4f",
      "destructive": "#d9534f",
      "destructiveForeground": "#ffffff",
      "input": "#e3ddcf",
      "ring": "#1e4a4f",
      "chart1": "#1e4a4f",
      "chart2": "#8fae8a",
      "chart3": "#b98a5a",
      "chart4": "#5f8580",
      "chart5": "#d2ad76",
      "sidebar": "#f0eadf",
      "sidebarForeground": "#2b2b28",
      "sidebarBorder": "#ddd4c4",
      "sidebarPrimary": "#1e4a4f",
      "sidebarPrimaryForeground": "#f7f2ea",
      "sidebarAccent": "#c8dcbe",
      "sidebarAccentForeground": "#1e4a4f",
      "sidebarRing": "#1e4a4f"
    },
    "dark": {
      "background": "#182526",
      "foreground": "#f7f2ea",
      "border": "#405456",
      "card": "#223335",
      "cardForeground": "#f7f2ea",
      "popover": "#223335",
      "popoverForeground": "#f7f2ea",
      "primary": "#c8dcbe",
      "primaryForeground": "#18383b",
      "secondary": "#8fae8a",
      "secondaryForeground": "#17261d",
      "muted": "#2b3b3d",
      "mutedForeground": "#c4beb3",
      "accent": "#33565a",
      "accentForeground": "#f7f2ea",
      "destructive": "#e37b76",
      "destructiveForeground": "#241414",
      "input": "#405456",
      "ring": "#c8dcbe",
      "chart1": "#c8dcbe",
      "chart2": "#8fae8a",
      "chart3": "#d2ad76",
      "chart4": "#73aaa4",
      "chart5": "#e4c18d",
      "sidebar": "#132021",
      "sidebarForeground": "#f7f2ea",
      "sidebarBorder": "#35494b",
      "sidebarPrimary": "#c8dcbe",
      "sidebarPrimaryForeground": "#18383b",
      "sidebarAccent": "#33565a",
      "sidebarAccentForeground": "#f7f2ea",
      "sidebarRing": "#c8dcbe"
    }
  },
  "fontFamily": {
    "sans": [
      "Poppins",
      "sans-serif"
    ],
    "serif": [
      "Georgia",
      "serif"
    ],
    "mono": [
      "Menlo",
      "monospace"
    ]
  },
  "radius": "0.875rem",
  "spacing": "0.25rem"
} as const;

export type Tokens = typeof tokens;
export default tokens;
