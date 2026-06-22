---
name: Oracle delivery decision
description: Direct browser fetch vs Cloudflare Worker for Claude oracle — which is current and why
---

# Oracle Delivery: Direct Browser Fetch vs Cloudflare Worker

## The rule
The **current implementation** uses direct browser fetch to Anthropic's API with `VITE_ANTHROPIC_API_KEY` and the `anthropic-dangerous-direct-browser-access: true` header. The CF Worker approach is a documented alternative.

**Why:** The original pre-session plan (Jamie's planning doc) called for a Cloudflare Worker proxy so the API key would never appear in client code. The June 22 build session diverged and implemented direct browser fetch instead — simpler, no Worker to deploy, acceptable for a personal single-user app.

## How to apply
- When working on oracle features: use `VITE_ANTHROPIC_API_KEY` and direct fetch in `src/lib/oracle.ts`.
- `VITE_ORACLE_WORKER_URL` is documented in `.env.example` and `docs/PRD-v4.0.md` Section 10 as the alternative path if someone wants to switch to CF Worker.
- Do NOT create a Worker or reference `VITE_ORACLE_WORKER_URL` in code unless explicitly asked to switch approaches.
- `docs/PRD-v4.0.md` Section 10 has the full migration path if the switch is ever needed.
