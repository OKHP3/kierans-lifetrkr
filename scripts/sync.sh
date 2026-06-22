#!/usr/bin/env bash
# scripts/sync.sh — Kieran's LifeTrkr
#
# Usage:
#   bash scripts/sync.sh           # type-check + commit + push to main
#   bash scripts/sync.sh --check   # type-check only (no commit, no push)
#   bash scripts/sync.sh --deploy  # type-check + build + push to gh-pages
#
# Never run --deploy without owner review. The owner controls production deploys.

set -e

REPO="OKHP3/kierans-lifetrkr"
LIVE_URL="https://okhp3.github.io/kierans-lifetrkr/#/"
MODE="${1:-sync}"

# ── Colours ────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RESET='\033[0m'

log()  { echo -e "${CYAN}▸ $1${RESET}"; }
ok()   { echo -e "${GREEN}✓ $1${RESET}"; }
warn() { echo -e "${YELLOW}⚠ $1${RESET}"; }
fail() { echo -e "${RED}✗ $1${RESET}"; exit 1; }

# ── Step 1: TypeScript check ────────────────────────────────────────────────
log "Running TypeScript check..."
npx tsc --noEmit || fail "TypeScript errors found — fix before syncing."
ok "TypeScript clean"

# ── --check mode: stop here ─────────────────────────────────────────────────
if [[ "$MODE" == "--check" ]]; then
  ok "Check complete. No files changed."
  exit 0
fi

# ── --deploy mode: full build + gh-pages ────────────────────────────────────
if [[ "$MODE" == "--deploy" ]]; then
  log "Verifying base path in vite.config.ts..."
  grep -q "kierans-lifetrkr" vite.config.ts \
    || fail "base path '/kierans-lifetrkr/' not found in vite.config.ts — unsafe to deploy."
  ok "Base path confirmed"

  log "Building for production..."
  npm run build || fail "Build failed — check TypeScript and Vite errors above."
  ok "Build succeeded"

  log "Deploying to gh-pages..."
  npm run deploy || fail "gh-pages deploy failed."
  ok "Deployed to gh-pages"

  echo ""
  ok "Live at: ${LIVE_URL}"
  exit 0
fi

# ── Default sync mode: commit + push to main ────────────────────────────────
log "Staging all changes..."
git add -A

# Check if there's anything to commit
if git diff --cached --quiet; then
  warn "Nothing to commit — working tree clean."
  exit 0
fi

# Build a default commit message from staged file count
CHANGED=$(git diff --cached --name-only | wc -l | tr -d ' ')
DEFAULT_MSG="chore: sync ${CHANGED} file(s) to main"

log "Committing (${CHANGED} file(s))..."
git commit -m "${DEFAULT_MSG}"

log "Pushing to main..."
git push origin main || fail "Push failed — check remote and credentials."

ok "Synced to https://github.com/${REPO}/tree/main"
