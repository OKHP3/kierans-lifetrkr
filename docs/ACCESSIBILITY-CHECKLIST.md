# Accessibility release check

## Automated gate

Run:

```sh
npm run check
npm run check:a11y
npm run build
```

The source check catches empty buttons and form controls without a programmatic name. It complements, but does not replace, browser and assistive-technology testing.

## Manual matrix

Run the matrix on a narrow phone viewport and a desktop viewport:

| Area | Keyboard | Screen reader | Visual/responsive |
| --- | --- | --- | --- |
| Navigation | Tab reaches every link; active route is visible | Navigation landmarks and link names are announced | 200% zoom and narrow landscape retain reachable content |
| Forms | Inputs, filters, date controls, toggles, and submit/cancel actions are reachable and operable | Labels, selected/expanded states, errors, loading, and sync status are announced | Focus ring and text remain legible in light/dark themes |
| Calendar | Previous/next month and every date cell are named and operable | Date, today/selected state, and event count are announced | Grid remains usable at 200% zoom and on touch |
| Dialogs | Focus can enter/leave the dialog; Escape/backdrop close where provided | Dialog title and modal state are announced | Dialog content scrolls without trapping the page |
| Feedback | Toast/banner can be reached and dismissed without a pointer | Status, alert, and error messages are announced | Long messages wrap and do not cover controls |
| Motion/touch | No action depends on animation | State changes remain understandable with motion reduced | Touch targets are at least 44px where practical; reduced motion disables transitions |

Record browser, OS, zoom, theme, and any failures with the release evidence.

## Agent evidence record — August 27, 2026

| Context | Scope | Result | Limit |
| --- | --- | --- | --- |
| Replit preview, desktop 1280×720, dark first-launch view | Rendered smoke and browser console | PASS; welcome content and both connection actions rendered; no application console errors | Not a keyboard, screen-reader, zoom, contrast, or touch evaluation |
| Replit preview, narrow phone viewport | Manual matrix | NOT RUN | No interactive narrow-viewport/assistive-technology browser path was available in this session |
| GitHub Pages, desktop hash URL | Rendered smoke | PASS for the currently published older candidate | Not evidence for the repaired candidate until post-push publication is verified |

The manual matrix remains an owner-run release gate. Do not promote the
rendered smoke result to a universal accessibility claim.