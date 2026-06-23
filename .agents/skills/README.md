---
name: lifetrkr-skill-index
description: >
  Index of skills available to agents in OKHP3/kierans-lifetrkr.
  Canonical skill content lives in .agents/skills/. Update the individual
  SKILL.md files when behavior changes.
---

# .agents/skills - kierans-lifetrkr

Skills loaded by AI agents when working on this project. These are targeted
capabilities scoped to the work done in this repo.

## Project Context

**Repo:** kierans-lifetrkr
**Repo type:** Application - mobile-first React SPA personal life OS
**Skill source:** [OKHP3/skillz](https://github.com/OKHP3/skillz)
**Deployed to:** `.agents/skills/`

## Skill Index

| Skill | Path | What it does |
|---|---|---|
| `find-skills` | `find-skills/SKILL.md` | Locate and reason about available project skills. |
| `frontend-design` | `frontend-design/SKILL.md` | Frontend design guidance for distinctive, intentional UI. |
| `celestial-engine` | `okhp3-celestial-data/SKILL.md` | Moon phase, astrological season, and Mercury retrograde, pure client-side with no API. |
| `daily-oracle` | `okhp3-daily-oracle/SKILL.md` | Three-layer daily reading: tarot, horoscope, and Claude AI, cached in localStorage. |
| `gis-token-model` | `okhp3-google-gis-client-auth/SKILL.md` | Client-only Google OAuth for SPAs with no backend, Client Secret, or redirect URI. |
| `github-pages-vite-spa` | `okhp3-vite-github-pages/SKILL.md` | Deploy a Vite SPA to GitHub Pages from `main` with correct base path and HashRouter routing. |
| `cloudflare-worker-api-proxy` | `okhp3-cloudflare-worker-api-proxy/SKILL.md` | Proxy API calls through a Cloudflare Worker to keep API keys server-side. |

## Skill Discovery Path

Agents discover skills by scanning `.agents/skills/` from the project root.
This works automatically in Replit, VS Code, Claude Code, Copilot, Codex,
Cursor, Gemini CLI, and other compliant agent clients when opened at the
project root.

`skillz` is the library source of truth. This directory is the deployed copy.
