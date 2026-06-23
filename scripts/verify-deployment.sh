#!/usr/bin/env bash
# =============================================================================
# verify-deployment.sh
# Run this in your LOCAL clone or Replit terminal to see the truth about
# what is committed vs. what exists only in your working directory.
# =============================================================================

set -uo pipefail

CYAN='\033[0;36m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; RESET='\033[0m'
ok()   { echo -e "${GREEN}✓ $*${RESET}"; }
warn() { echo -e "${YELLOW}⚠ $*${RESET}"; }
err()  { echo -e "${RED}✗ $*${RESET}"; }
hdr()  { echo -e "\n${CYAN}── $* ──${RESET}"; }

hdr "Current branch and recent commits"
git rev-parse --abbrev-ref HEAD
git log --oneline -8

hdr "Uncommitted / untracked files (these are NOT on GitHub yet)"
UNTRACKED=$(git status --porcelain | wc -l | tr -d ' ')
if [[ "$UNTRACKED" -gt 0 ]]; then
  warn "$UNTRACKED file(s) not committed:"
  git status --porcelain
else
  ok "Working tree clean — everything is committed"
fi

hdr "What main branch actually contains (committed files only)"
git ls-tree -r --name-only HEAD | head -60

hdr "Key files: committed on main?"
for f in AGENTS.md .agents/AGENTS.md replit.md scripts/sync.sh \
         .agents/skills/okhp3-celestial-data/SKILL.md \
         .agents/skills/okhp3-daily-oracle/SKILL.md \
         .agents/skills/okhp3-google-gis-client-auth/SKILL.md \
         .agents/skills/okhp3-vite-github-pages/SKILL.md \
         .agents/skills/okhp3-cloudflare-worker-api-proxy/SKILL.md \
         src/App.tsx src/constants.ts docs/PRD-v4.0.md; do
  if git cat-file -e "HEAD:$f" 2>/dev/null; then
    ok "committed: $f"
  elif [[ -e "$f" ]]; then
    warn "exists locally but NOT committed: $f"
  else
    err "missing entirely: $f"
  fi
done

hdr "Has main been pushed to origin?"
LOCAL=$(git rev-parse HEAD 2>/dev/null)
REMOTE=$(git rev-parse origin/main 2>/dev/null || echo "no-remote")
if [[ "$LOCAL" == "$REMOTE" ]]; then
  ok "Local main matches origin/main — fully pushed"
elif [[ "$REMOTE" == "no-remote" ]]; then
  err "No origin/main found — never pushed"
else
  warn "Local main is AHEAD of origin/main — you have unpushed commits"
  git log --oneline origin/main..HEAD 2>/dev/null | head -10
fi

echo ""
echo -e "${CYAN}Done. If you see 'exists locally but NOT committed' or 'AHEAD of origin',${RESET}"
echo -e "${CYAN}run: git add -A && git commit -m 'feat: full project state' && git push origin main${RESET}"
