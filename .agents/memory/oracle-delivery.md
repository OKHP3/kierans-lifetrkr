---
name: Oracle delivery decision
description: Direct browser fetch vs Cloudflare Worker for Claude oracle — which is current and why
---

# Oracle Delivery: Local Fallback and Optional Worker

## The rule
The **current implementation** uses local tarot/celestial data with an optional server-side oracle worker configured by `VITE_ORACLE_WORKER_URL`. No Anthropic credential is exposed to the browser.

**Why:** Keeping provider credentials outside the client preserves the app's client-only privacy boundary while allowing the worker to remain an optional enhancement. The local tarot meaning is always available when the worker is absent or unavailable.

## How to apply
- When working on oracle features: keep the local fallback functional and send only the documented celestial summary to `VITE_ORACLE_WORKER_URL`.
- Do not add a client-side provider credential or send profile, task, habit, or calendar data to the worker.
- The worker is optional; its absence, failure, rate limit, or invalid response must fall back to the tarot card's upright meaning.
