#!/usr/bin/env bash
# =============================================================================
# scripts/sync.sh — Kieran's LifeTrkr
# Sync source to GitHub main and optionally deploy to GitHub Pages.
#
# Usage:
#   ./scripts/sync.sh              # sync source to main only
#   ./scripts/sync.sh --deploy     # sync source + deploy to gh-pages
#   ./scripts/sync.sh --check      # type check only, no git operations
#   ./scripts/sync.sh --help       # show this help
#
# This script mirrors the sync pattern used across OKHP3 repos.
# Adapted for npm (not pnpm) and LifeTrkr's GitHub Pages deployment target.
# =============================================================================

set -euo pipefail

# ── Colors ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RESET='\033[0m'

# ── Helpers ──────────────────────────────────────────────────────────────────
info()    { echo -e "${CYAN}▸ $*${RESET}"; }
success() { echo -e "${GREEN}✓ $*${RESET}"; }
warn()    { echo -e "${YELLOW}⚠ $*${RESET}"; }
error()   { echo -e "${RED}✗ $*${RESET}" >&2; }
step()    { echo -e "\n${BLUE}── $* ──${RESET}"; }

# ── Usage ────────────────────────────────────────────────────────────────────
usage() {
  echo "Usage: ./scripts/sync.sh [--deploy] [--check] [--help]"
  echo ""
  echo "  (no flags)   Type check, then sync source to main branch"
  echo "  --deploy     Type check, sync source to main, deploy to gh-pages"
  echo "  --check      Type check only — no git operations"
  echo "  --help       Show this help"
  exit 0
}

# ── Parse args ───────────────────────────────────────────────────────────────
DO_DEPLOY=false
CHECK_ONLY=false

for arg in "$@"; do
  case $arg in
    --deploy)  DO_DEPLOY=true ;;
    --check)   CHECK_ONLY=true ;;
    --help|-h) usage ;;
    *)
      error "Unknown argument: $arg"
      usage
      ;;
  esac
done

# ── Preflight ────────────────────────────────────────────────────────────────
step "Preflight"

if ! command -v node &>/dev/null; then
  error "Node.js not found. Install Node.js 18+ first."
  exit 1
fi

if ! command -v npm &>/dev/null; then
  error "npm not found."
  exit 1
fi

if [[ ! -f "package.json" ]]; then
  error "Run this script from the repo root."
  exit 1
fi

if [[ ! -f "vite.config.ts" ]]; then
  error "vite.config.ts not found. Are you in the right repo?"
  exit 1
fi

# Confirm base path is set
if ! grep -q "kierans-lifetrkr" vite.config.ts; then
  error "vite.config.ts is missing base: '/kierans-lifetrkr/' — do not deploy without it."
  exit 1
fi

success "Preflight passed"

# ── Type check ───────────────────────────────────────────────────────────────
step "TypeScript check"

info "Running tsc --noEmit..."
if npx tsc --noEmit; then
  success "TypeScript: zero errors"
else
  error "TypeScript errors found. Fix all errors before syncing."
  exit 1
fi

if [[ "$CHECK_ONLY" == "true" ]]; then
  success "Check-only mode: done."
  exit 0
fi

# ── Git status ───────────────────────────────────────────────────────────────
step "Git status"

BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
info "Current branch: $BRANCH"

if [[ "$BRANCH" != "main" ]]; then
  warn "Not on main branch (on '$BRANCH'). Continuing anyway."
fi

UNCOMMITTED=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
if [[ "$UNCOMMITTED" -eq 0 ]]; then
  warn "No uncommitted changes to sync."
  if [[ "$DO_DEPLOY" == "false" ]]; then
    info "Nothing to do. Use --deploy to redeploy without source changes."
    exit 0
  fi
else
  info "$UNCOMMITTED file(s) staged or modified."
fi

# ── Commit and push source ────────────────────────────────────────────────────
step "Sync source → main"

# Get current version from constants.ts
VERSION=$(grep -o "'v[0-9]*\.[0-9]*\.[0-9]*'" src/constants.ts 2>/dev/null | head -1 | tr -d "'" || echo "unknown")
info "App version: $VERSION"

if [[ "$UNCOMMITTED" -gt 0 ]]; then
  info "Staging all changes..."
  git add -A

  COMMIT_MSG="chore: sync source ${VERSION} — $(date '+%Y-%m-%d')"
  info "Committing: $COMMIT_MSG"
  git commit -m "$COMMIT_MSG"

  info "Pushing to origin/main..."
  git push origin main
  success "Source synced to main"
else
  info "No uncommitted changes — skipping commit"
  success "Source already current on main"
fi

# ── Deploy to GitHub Pages ────────────────────────────────────────────────────
if [[ "$DO_DEPLOY" == "true" ]]; then
  step "Deploy → gh-pages"

  info "Building production bundle..."
  if npm run build; then
    success "Build succeeded"
  else
    error "Build failed. Fix build errors before deploying."
    exit 1
  fi

  info "Deploying to gh-pages branch..."
  if npx gh-pages -d dist; then
    success "Deployed to gh-pages"
  else
    error "gh-pages deployment failed."
    exit 1
  fi

  echo ""
  echo -e "${GREEN}════════════════════════════════════════════${RESET}"
  echo -e "${GREEN}  Deployment complete — $VERSION${RESET}"
  echo -e "${GREEN}  https://okhp3.github.io/kierans-lifetrkr/#/${RESET}"
  echo -e "${GREEN}════════════════════════════════════════════${RESET}"
  echo ""
  info "Verify the live URL loads correctly before closing this session."
else
  echo ""
  success "Source sync complete. Run with --deploy to push to GitHub Pages."
fi
