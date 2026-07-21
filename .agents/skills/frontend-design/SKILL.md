---
name: frontend-design
description: Design and implement distinctive, production-ready web interfaces with coherent visual systems, responsive behavior, accessible interaction, and polished states. Use when building or refining websites, pages, dashboards, components, React views, or HTML/CSS UI; do not use for backend architecture or deployment-only work.
license: Complete terms in LICENSE.txt
---

# Frontend design

Create a working interface with a deliberate point of view, not a decorative mockup. Keep the skill generic: derive the product’s visual language from the repository and brief instead of imposing a house style.

## Scope

| In scope | Out of scope |
| --- | --- |
| Page and component design, visual systems, responsive layouts, interaction states, accessibility, and UI refinement | Backend or API design, deployment configuration, unrelated refactors, and invented product requirements |

## Workflow

### 1. Inspect

Read the repository guidance, package manifest, entry points, routes, existing components, styles/tokens, and relevant assets before changing code. Check the working tree and preserve unrelated edits. Identify the target users, primary action, content hierarchy, supported breakpoints, and existing technical constraints.

### 2. Plan

Commit to one clear visual direction that fits the product context. Write a compact plan covering:

- hierarchy and the one memorable design decision;
- typography, color, spacing, surface, and state tokens;
- mobile, desktop, empty, loading, error, disabled, hover, focus, and reduced-motion behavior;
- semantic structure, keyboard flow, contrast, touch targets, and performance risks.

Prefer the repository’s existing tokens and components. Add a new dependency only when the current stack cannot meet the requirement and the user has authorized the scope.

### 3. Execute

Implement real, maintainable code in the project’s existing framework and styling approach. Use semantic HTML and accessible names, visible focus, keyboard-operable controls, responsive composition, and content that reflects the brief. Make visual choices specific to the product: avoid defaulting to interchangeable card grids, generic system typography, ornamental gradients, or unmotivated animation.

Build the complete interaction surface, including feedback for success, failure, loading, empty data, disabled controls, and narrow screens. Respect existing routing, state ownership, data contracts, and theme variables unless the task explicitly changes them.

### 4. Validate

Run the repository’s relevant checks and build commands. Inspect the diff for accidental scope expansion, secrets, generated files, broken imports, and inconsistent tokens. Exercise the changed flow at narrow and wide widths; verify keyboard focus and reduced motion where the environment permits. If a check cannot run, report the exact blocker rather than claiming success.

## Gotchas

- Do not invent copy, metrics, routes, API responses, or states that the product does not support.
- Do not replace a working design system with a framework default merely to move faster.
- Do not treat “distinctive” as permission for poor contrast, tiny controls, motion overload, or inaccessible custom interactions.
- Prefer CSS and existing libraries for simple effects; keep animation purposeful and interruptible.
- Preserve existing user data and state flows; visual polish must not change behavior accidentally.

## Output contract

Return:

1. the changed files and the implemented user-visible behavior;
2. the chosen visual direction and key design-system decisions;
3. accessibility and responsive states covered;
4. validation commands and results, including blockers or follow-up risks.

Keep the final summary concise and distinguish verified facts from assumptions.
