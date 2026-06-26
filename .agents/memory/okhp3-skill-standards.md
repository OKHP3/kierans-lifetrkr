---
name: OKHP3 skill standards
description: agentskills.io eval schema, footer style, and Gotchas section authoring rules for OKHP3 skills
---

## evals.json field name
agentskills.io spec uses `assertions` (not `expectations`). The Foundry internal docs use
`expectations` but the open standard is `assertions`. Use `assertions` for portability.

**Why:** Discovered from agentskills.io/skill-creation/evaluating-skills.md — the canonical spec.

## MIT License footer style
The cataloger uses em dash `—`: `MIT License — free to use, fork, and adapt.`
The foundry/brand-standard.md uses `--` (double hyphen).
**Use em dash `—`** — cataloger is the more polished/recent reference.

**Why:** User said to emulate the cataloger's footer formatting. Cataloger is v1.4.0, foundry v1.0.0.

## Gotchas sections are highest-ROI skill content
Per agentskills.io best-practices: "The highest-value content in many skills is a list of gotchas —
environment-specific facts that defy reasonable assumptions."
Keep Gotchas in SKILL.md (not in a reference file) so agents read them before encountering the situation.

**How to apply:** After running evals, every assertion that fails in without_skill but passes
with_skill = a gotcha candidate. Extract the discriminating fact and add to ## Gotchas.

## Progressive disclosure in References
Tell agents WHEN to load each file: "Load when implementing from scratch" or "Load when debugging
type errors" — not just "see references/ for details."

## Skill directory structure (showpiece standard)
Each skill should have: `evals/`, `scripts/`, `assets/`, `benchmarks/`, `references/`, `workspace/`
- `scripts/` — self-contained Node.js .cjs files, no external deps, runnable with `node`
- `assets/` — copy-paste templates, checklists, component starters
- `benchmarks/` — benchmark.json with run_summary, delta, acceptance, fix_targets
- `workspace/iteration-N/` — eval-{name}/with_skill/ + without_skill/ grading files

## Eval acceptance bar (Foundry)
with_skill mean >= 0.9 AND delta >= 0.5 = PASS
If with_skill < 0.9, fix the skill.
If delta < 0.5, assertions are not discriminating enough — tighten them.
