#!/usr/bin/env bash
# scripts/sync.sh — Kieran's LifeTrkr
#
# Usage:
#   bash scripts/sync.sh           # check + commit + fetch/reconcile + safe push
#   bash scripts/sync.sh --check   # type-check only (no commit, no network)
#
# Production deploys are handled by GitHub Actions on pushes to main.

set -Eeuo pipefail

REPO="OKHP3/kierans-lifetrkr"
LIVE_URL="https://okhp3.github.io/kierans-lifetrkr/#/"
MODE="${1:-sync}"
ORIGIN_URL="https://github.com/${REPO}.git"

# ── Colours ────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RESET='\033[0m'

log()  { echo -e "${CYAN}▸ $*${RESET}"; }
ok()   { echo -e "${GREEN}✓ $*${RESET}"; }
warn() { echo -e "${YELLOW}⚠ $*${RESET}"; }
fail() { echo -e "${RED}✗ $*${RESET}" >&2; exit 1; }

report_actions() {
  local commit="$1"
  if command -v gh >/dev/null 2>&1; then
    log "Recording GitHub Actions status for ${commit:0:12}..."
    gh run list --repo "$REPO" --commit "$commit" --limit 5 \
      --json name,status,conclusion,url --template '{{range .}}{{.name}}: {{.status}} ({{.conclusion}}) {{.url}}{{"\n"}}{{end}}' && return 0
    warn "GitHub CLI status lookup failed; trying the bound connection..."
    if [[ -n "${REPLIT_CONNECTORS_HOSTNAME:-}" || -n "${REPLIT_IDENTITY:-}" ]]; then
      log "Recording GitHub Actions status for ${commit:0:12} via the bound connection..."
      node scripts/github-actions-status.mjs "$commit" ||
        warn "GitHub Actions status could not be read; inspect the Actions tab for ${commit:0:12}."
      return 0
    fi
  elif [[ -n "${REPLIT_CONNECTORS_HOSTNAME:-}" || -n "${REPL_IDENTITY:-}" ]]; then
    log "Recording GitHub Actions status for ${commit:0:12} via the bound connection..."
    node scripts/github-actions-status.mjs "$commit" ||
      warn "GitHub Actions status could not be read; inspect the Actions tab for ${commit:0:12}."
  else
    warn "GitHub CLI is unavailable; Actions status is pending. Check GitHub Actions for ${commit:0:12}."
  fi
}

if [[ "$MODE" != "sync" && "$MODE" != "--check" ]]; then
  fail "Unknown mode '$MODE'. Use no argument or --check."
fi

ROOT=$(git rev-parse --show-toplevel 2>/dev/null) ||
  fail "Run this command from inside the Git repository."
cd "$ROOT"

[[ "$(git symbolic-ref --short HEAD 2>/dev/null || true)" == "main" ]] ||
  fail "Refusing to sync: checked out branch is not 'main'. Switch to main first."

if git diff --name-only --diff-filter=U | grep -q .; then
  fail "Refusing to sync: unresolved merge conflicts exist. Resolve them before syncing."
fi

ORIGIN=$(git remote get-url origin 2>/dev/null) ||
  fail "Refusing to sync: canonical remote 'origin' is not configured."

if [[ "$ORIGIN" =~ ^[a-zA-Z][a-zA-Z0-9+.-]*://[^/@]+@ ]] ||
   [[ "$ORIGIN" =~ ^[^/@]+@[^:]+: ]]; then
  fail "Refusing to sync: origin contains embedded credentials. Remove them with: git remote set-url origin ${ORIGIN_URL}"
fi

if [[ "$ORIGIN" != "$ORIGIN_URL" && "$ORIGIN" != "https://github.com/${REPO}" ]]; then
  fail "Refusing to sync: origin must be ${ORIGIN_URL} (found a different repository)."
fi

# ── Step 1: TypeScript check ────────────────────────────────────────────────
log "Running TypeScript check..."
npm run check || fail "TypeScript errors found — fix before syncing."
ok "TypeScript clean"

# ── --check mode: stop here ─────────────────────────────────────────────────
if [[ "$MODE" == "--check" ]]; then
  ok "Check complete. No files changed."
  exit 0
fi

# ── Step 2: Commit local work before reconciliation ──────────────────────────
log "Staging all changes..."
git add -A

if git diff --cached --quiet; then
  warn "Nothing to commit — working tree clean."
else
  CHANGED=$(git diff --cached --name-only | wc -l | tr -d ' ')
  DEFAULT_MSG="chore: sync ${CHANGED} file(s) to main"
  log "Committing (${CHANGED} file(s))..."
  git commit -m "${DEFAULT_MSG}"
fi

# ── Step 3: Fetch and classify remote state ──────────────────────────────────
log "Fetching origin/main before reconciliation..."
git fetch --prune origin main ||
  fail "Fetch failed. No push was attempted; check network access and GitHub authorization."

LOCAL=$(git rev-parse main)
REMOTE=$(git rev-parse origin/main)
BASE=$(git merge-base main origin/main)

if [[ "$LOCAL" == "$REMOTE" ]]; then
  ok "Local main already matches origin/main (${LOCAL:0:12})"
  report_actions "$LOCAL"
  ok "Synced to https://github.com/${REPO}/tree/main"
  exit 0
elif [[ "$LOCAL" == "$BASE" ]]; then
  log "Remote is ahead; fast-forwarding local main..."
  git merge --ff-only origin/main ||
    fail "Remote-ahead recovery was not a fast-forward. No push was attempted."
elif [[ "$REMOTE" == "$BASE" ]]; then
  ok "Local main is ahead of origin/main; no rebase needed."
else
  warn "Local and remote have diverged; rebasing local commits onto origin/main."
  if ! git rebase origin/main; then
    git rebase --abort >/dev/null 2>&1 || true
    fail "Rebase conflict detected. Rebase was aborted; resolve the conflict manually, then rerun sync. No push was attempted."
  fi
fi

# ── Step 4: Safe push and post-push convergence check ────────────────────────
log "Pushing main without force..."
if ! git push --set-upstream origin main; then
  warn "Git transport could not authenticate. Trying the bound GitHub connection without storing credentials..."
  if [[ -n "${REPLIT_CONNECTORS_HOSTNAME:-}" || -n "${REPLIT_IDENTITY:-}" ]] &&
     node scripts/github-api-publish.mjs "$LOCAL"; then
    log "Fetching the published commit for local convergence..."
    git fetch --prune origin main ||
      fail "The commit was published, but its public read-back failed. Inspect origin/main before retrying."
    REMOTE=$(git rev-parse origin/main)
    LOCAL_TREE=$(git rev-parse main^{tree})
    REMOTE_TREE=$(git rev-parse origin/main^{tree})
    [[ "$LOCAL_TREE" == "$REMOTE_TREE" ]] ||
      fail "Published tree differs from local main. No further update was attempted."
    [[ "$LOCAL" == "$REMOTE" ]] || git reset --hard origin/main
  else
    fail "Push rejected. No force-push is used; fetch again and follow docs/GIT-SYNC.md."
  fi
fi

git fetch --prune origin main ||
  fail "Could not refresh origin/main after pushing. Stop and inspect remote state."
LOCAL=$(git rev-parse main)
REMOTE=$(git rev-parse origin/main)
[[ "$LOCAL" == "$REMOTE" ]] ||
  fail "Push returned but local main does not match origin/main. Stop and inspect before retrying."

ok "Local main equals origin/main (${LOCAL:0:12})"
report_actions "$LOCAL"
ok "Synced to https://github.com/${REPO}/tree/main"
