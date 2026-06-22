# Kieran's LifeTrkr — Design System Amendment
# "Moonlit Hearth" — Stevie Nicks / celestial / warmly mystical
# Replaces the Design System section in REPLIT_AGENT_PROMPT.md

---

## Design Direction

The aesthetic is warm mystical dark, not cold goth, not neon cyber.
Reference: Stevie Nicks. Velvet, candlelight, amethyst, old books, sage smoke.
It should feel personal and calm, not dramatic or oppressive.
The app is a sanctuary, not a haunted house.

---

## Color Tokens

Replace tailwind.config.ts custom colors with these:

```javascript
colors: {
  bg:            "#0D0B14",   // deep midnight purple-black (base layer)
  surface:       "#1A1424",   // cards, nav, modals
  surfaceRaised: "#251B30",   // input fields, hover states, badges
  border:        "#3A2A4A",   // dividers, card edges, unchecked circles
  borderSubtle:  "#251B30",   // inner dividers within cards
  textPrimary:   "#EAE0F8",   // warm moonstone white — all primary text
  textSecondary: "#9B8AB0",   // muted lavender — labels, metadata
  textMuted:     "#7B6A8C",   // very muted — timestamps, "done" items
  textGhost:     "#4A3560",   // near-invisible — decorative elements
  accentAmethyst:"#C4A0E8",   // primary CTA, active nav tab, streak counter
  accentGold:    "#E8B86D",   // calendar events, highlights, milestone streaks
  accentSage:    "#4ECFA0",   // completion states, checked habits, done tasks
  accentRose:    "#D4756B",   // high priority, destructive actions
}
```

Body background: bg (#0D0B14)
Never use pure black (#000000) anywhere. Always use bg as the darkest value.

---

## Typography

Load via Google Fonts (add to index.html <head>):

```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@400;500&family=Space+Mono&display=swap" rel="stylesheet">
```

| Role | Font | Weight | Size | Usage |
|---|---|---|---|---|
| Display / Greeting name | Cormorant Garamond | 300 | 28-32px | "Kieran" on home screen |
| Section headers | DM Sans | 500 | 16-18px | Tab page titles |
| Card labels | DM Sans | 500 | 13px | Card header text |
| Body / item text | DM Sans | 400 | 13px | Checklist items, task titles |
| Secondary labels | DM Sans | 400 | 11-12px | Timestamps, metadata |
| Time / streak counts | Space Mono | 400 | 11px | "9:41 PM", streak numbers |

Cormorant Garamond is used sparingly — only for the greeting name on Home and major section display moments. Everything else is DM Sans. This restraint is what makes it feel elegant rather than costume-y.

---

## Tab Labels and Icons

Rename tabs to fit the aesthetic. Use Tabler outline icons.

| Tab | Label | Tabler Icon | Notes |
|---|---|---|---|
| 1 | Home | ti-home | Standard |
| 2 | Rituals | ti-repeat | "Routines" renamed — fits the vibe perfectly |
| 3 | Habits | ti-moon | Moon as the habit/practice symbol |
| 4 | Calendar | ti-calendar | Standard |
| 5 | Today | ti-feather | Feather instead of checkbox — lighter energy |
| 6 | Archive | ti-scroll | "Backlog" renamed — feels more intentional |

Active tab: accentAmethyst (#C4A0E8) icon + label, font-weight 500.
Inactive tabs: textMuted (#7B6A8C).
Bottom nav background: surface (#1A1424).
Bottom nav border-top: 0.5px solid border (#3A2A4A).

---

## Component Standards

### Cards
```css
background: #1A1424;
border: 0.5px solid #3A2A4A;
border-radius: 14px;
padding: 13px 14px;
margin-bottom: 10px;
```

### Circular checkboxes
Unchecked:
```css
width: 18px; height: 18px;
border-radius: 50%;
border: 1.5px solid #3A2A4A;
```
Checked:
```css
width: 18px; height: 18px;
border-radius: 50%;
background: #4ECFA0;
/* White checkmark SVG inside */
```

Done (completed) text:
```css
color: #4A3560;
text-decoration: line-through;
```

### Calendar event accent bars
Left accent bar for events:
```css
width: 3px; height: 30px;
border-radius: 2px;
/* Color varies by event source or category */
/* Default: accentAmethyst #C4A0E8 */
/* Secondary: accentGold #E8B86D */
```

### Badge / pill (compact label)
```css
font-size: 10px;
color: #C4A0E8;
background: #251B30;
padding: 2px 8px;
border-radius: 10px;
```

### Streak counter (habits)
Moon icon (ti-moon) + count in Space Mono.
Color by milestone:
- Default: accentAmethyst (#C4A0E8)
- 30+ days: accentGold (#E8B86D) — gold moon, she earned it

### 7-day habit grid
Seven equal circles, 22px diameter, 5px gap.
Today's circle is always the last (rightmost).
Completed day: background accentSage (#4ECFA0), letter in bg (#0D0B14), font-weight 500.
Missed day: border 1.5px solid border (#3A2A4A), letter in textGhost (#4A3560).
Today if completed: background accentAmethyst (#C4A0E8).

### More section divider
```
∿   more   ∿
```
Font-size: 10px. Color: textGhost (#4A3560). Letter-spacing: 0.1em. Centered.
This is the only decorative text element. Keep it subtle.

### FAB (floating action button)
56px circle. Background: accentAmethyst (#C4A0E8). Icon: ti-plus in bg (#0D0B14).
Positioned: bottom-right, 20px from edge, 84px from bottom (above nav bar).

---

## Greeting Logic

Home screen greeting follows time of day:
- Before noon: "Good morning"
- 12pm to 5pm: "Good afternoon"
- After 5pm: "Good evening"

The star glyph ✦ appears once after the name, in accentAmethyst.
```
GOOD EVENING          ← 10px, DM Sans 400, textMuted, letter-spacing 0.12em
Kieran ✦             ← 28px, Cormorant Garamond 300, textPrimary
Monday, June 21       ← 12px, DM Sans 400, textMuted
[Summer Solstice]     ← 10px badge, ONLY on solstices and equinoxes (Mar 20, Jun 21, Sep 22, Dec 21)
```

Seasonal/celestial badges to detect and show:
| Date | Badge text |
|---|---|
| Mar 20 | Spring Equinox |
| Jun 21 | Summer Solstice |
| Sep 22 | Autumn Equinox |
| Dec 21 | Winter Solstice |
| Oct 31 | Samhain |
| Feb 2 | Imbolc |
| May 1 | Beltane |
| Aug 1 | Lughnasadh |

Badge style: 10px, color textGhost (#4A3560), background surface (#1A1424), border 0.5px solid borderSubtle, border-radius 8px, padding 2px 7px.
These fire automatically based on the current date. No user setup needed. Kieran will discover them.

---

## Easter Egg — Generational Watermark

Add this as a comment block at the top of App.tsx:

```typescript
/*
 * Kieran's LifeTrkr
 * ─────────────────
 * v3.0 — Kieran
 * v2.0 — Jamie
 * v1.0 — Vyrle
 * v0.0 — Ralph
 *
 * Built with love. The fourth Hill.
 */
```

Optionally: add a hidden "About" easter egg. If the user taps the ✦ star next to "Kieran" on the home screen 3 times, show a modal:
```
Kieran's LifeTrkr  ·  v3.0

The fourth generation.
Ralph · Vyrle · Jamie · Kieran

Built with ✦
```

This is for Jamie and Kieran to discover together on their first real use session.

---

## Rotating Quote Pool (Home "More" section)

Hardcode these 12 quotes. Pull a new one each day (index = day of year mod 12).
All fit Kieran's spiritual/literary sensibility:

```typescript
const quotes = [
  "She is a free spirit who soars through all barriers.",
  "The moon is always whole.",
  "Go where the energy is kind.",
  "Trust the timing of your life.",
  "Magic is believing in yourself.",
  "She is clothed in strength and dignity.",
  "You are allowed to be both a masterpiece and a work in progress.",
  "In the middle of difficulty lies opportunity.",
  "Do small things with great love.",
  "The quieter you become, the more you can hear.",
  "She decided to free herself, dance into the wind.",
  "Bloom where you are planted.",
];
```

---

## What NOT to Do

- No pure black (#000) anywhere. Use #0D0B14 as the true dark.
- No neon or fluorescent accents. Everything is desaturated and warm.
- No skull, pentagram, or overtly occult imagery — she's spiritual, not theatrical.
- No OKHP3 branding, wordmarks, or P³ language anywhere in the UI.
- No gradients on interactive elements.
- No cold blue tones — the palette is warm purple-black, not tech-dark.
- Do not use Cormorant Garamond for body text. It reads poorly at small sizes. DM Sans only below 16px.

---

## Summary: What Makes This "Moonlit Hearth" and Not Generic Dark Mode

1. Background is #0D0B14 — purple-tinted dark, not cold black.
2. Primary text is #EAE0F8 — warm moonstone white, not pure white.
3. Accent is amethyst (#C4A0E8) — not blue, not green, not orange.
4. Display type is Cormorant Garamond — literary, flowing, feminine.
5. Moon icon replaces flame for habits — intentional, not default.
6. Tab labels say "Rituals" and "Archive" — vocabulary carries the vibe.
7. Seasonal badges fire automatically — the app knows when it's the solstice.
8. Streak milestone turns gold at 30 days — earned, not given.
9. The generational Easter egg is there for the day Jamie shows her.

That's the difference between dark mode and a designed world.

---

*Design System Amendment — Moonlit Hearth v1.0*
*Feed to Replit agent alongside REPLIT_AGENT_PROMPT.md*
