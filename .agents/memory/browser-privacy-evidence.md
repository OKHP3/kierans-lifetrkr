---
name: Browser privacy evidence
description: Evidence boundary for browser-level account-isolation and OAuth lifecycle checks
---

Rendered-browser tests can prove local namespace switching, reload persistence,
date-only history preservation, disconnect state, expiry UI, and storage-failure
handling with disposable labels and placeholder identity callbacks. They cannot
prove Google consent, Google API responses, or real-account switching unless a
real owner-controlled OAuth journey is completed.

**Why:** A browser-path pass is useful evidence, but treating a stubbed GIS
callback as real OAuth would overstate the release claim and could encourage
recording personal data that the evidence plan explicitly excludes.

**How to apply:** Keep disposable browser results in the Google evidence and
handoff records. Record only profile labels, timezone changes, date values
needed for pass/fail, and redacted localStorage key names; keep real Google
checks as a separate owner-run gate.

For recurrence journeys, also record the configured timezone and the exact
calendar date used by the browser check. A date-only result without its
timezone is not reproducible evidence when due-state rules or exceptions are
being evaluated.

**Why:** The Rituals UI derives both the visible due state and completion guard
from the configured calendar date, not necessarily the host browser's zone.

**How to apply:** Seed a disposable browser profile with an explicit timezone,
log the resulting date, and keep prior completion records in the journey so a
skipped item can be shown not to rewrite history.