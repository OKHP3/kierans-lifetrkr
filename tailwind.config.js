/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:            "#0D0B14",
        surface:       "#1A1424",
        surfaceRaised: "#251B30",
        border:        "#3A2A4A",
        borderSubtle:  "#251B30",
        textPrimary:   "#EAE0F8",
        textSecondary: "#9B8AB0",
        textMuted:     "#7B6A8C",
        textGhost:     "#4A3560",
        accentAmethyst:"#C4A0E8",
        accentGold:    "#E8B86D",
        accentSage:    "#4ECFA0",
        accentRose:    "#D4756B",
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
