# Safe GitHub synchronization

LifeTrkr has one canonical source remote: `origin`

```text
https://github.com/OKHP3/kierans-lifetrkr.git
```

`main` is the only release branch. GitHub Actions runs CI and deploys GitHub
Pages after a push to `main`. Do not force-push `main` or create a `gh-pages`
deployment branch.

## Normal sync

From the repository root:

```bash
npm run sync
```

On Windows this command selects Git Bash from Git for Windows, avoiding the
Windows `bash.exe` alias that requires WSL. `SYNC_BASH` can select a portable
Git Bash installation. Linux and Replit use Bash from `PATH`. Shell files
use LF line endings through `.gitattributes`.

The command type-checks, commits the current working tree, fetches
`origin/main`, classifies the two histories, reconciles safely, pushes without
force, and confirms that local `main` equals `origin/main`. In Replit, if the
Git transport has no credential helper, it uses the already-bound GitHub
connection's API with a compare-and-swap ref update; no token is written to
Git config or the repository. If GitHub CLI is installed (or the bound
connection is available in Replit), it also prints Actions runs for the pushed
commit. Use
`npm run sync -- --check` for a type-check-only check with no commit or network
activity.

A remote-only update fast-forwards and stops without attempting a push.
Fetching does not prune unrelated refs. Divergent local commits receive a
recovery ref under `refs/archive/sync-before-rebase/` before rebasing. When
the API fallback publishes an equivalent tree with a different commit SHA,
sync preserves the old commit, requires a clean checkout, and moves only the
branch ref with an expected-old-SHA guard. It never uses a hard reset.

If GitHub rejects publication because branch rules require a pull request,
publish a reviewed `codex/` branch and merge it through GitHub after CI.
Do not change protections or retry the same rejected push repeatedly.

Replit's Git panel and the Replit app connector have separate authorization
from Shell Git. A clean checkout and matching commit SHAs do not prove those
connections are authenticated. Refresh the Git panel after Shell recovery;
if it still requests GitHub access, reconnect the existing GitHub provider in
Replit account settings and complete any owner-only passkey confirmation.

If the bound connector rejects a protected tree path such as
`.github/workflows`, the publisher retries that API request through
`https://api.github.com` using the existing `GITHUB_PAT` Replit Secret in
memory only. The token is never written to Git config, the repository, or
logs.

Only `origin` is used for release synchronization. Replit backup/subrepl
remotes may exist for the workspace, but they are not release sources.

## Remote-ahead recovery

If GitHub has commits not present locally, sync uses a fast-forward only:

```bash
git fetch origin main
npm run sync
```

If local uncommitted changes prevent a safe recovery, save them in a normal
commit or use a temporary patch/branch before retrying. Never reset or force
push to make the histories appear aligned.

## Conflict recovery

If local and remote histories diverge, sync attempts a non-destructive rebase
of local commits onto `origin/main`. Semantic conflicts stop the operation and
the attempted rebase is aborted; no push occurs. Inspect the competing
commits, resolve intentionally, then run:

```bash
git fetch origin main
git rebase origin/main
# resolve files, git add <resolved-files>, git rebase --continue
npm run sync
```

If the resolution is uncertain, stop and ask for review. Do not use
`git push --force` on `main`.

## Unsafe-state messages

Sync refuses to run when the checked-out branch is not `main`, unresolved merge
conflicts exist, `origin` is missing or points at another repository, or the
remote URL contains embedded credentials. Normalize a stale URL without
printing or copying credentials:

```bash
git remote set-url origin https://github.com/OKHP3/kierans-lifetrkr.git
```

The GitHub Replit connection is the authorized access path; credentials must
not be stored in Git config, scripts, or documentation.

If a credential-bearing remote has ever been exposed, delete or revoke that
credential in GitHub before the next source-control operation. A classic
personal access token must be revoked by its owner from GitHub Settings →
Developer settings → Personal access tokens; the Replit GitHub connection
cannot revoke a separate personal access token. Do not reuse the exposed
credential after normalizing the remote.

## Deployment verification and rollback

After a successful push, inspect the commit's CI and Deploy to GitHub Pages
runs. From a clone with GitHub CLI:

```bash
bash scripts/verify-deployment.sh
gh run list --repo OKHP3/kierans-lifetrkr --commit "$(git rev-parse HEAD)"
```

The expected published URL is:
https://okhp3.github.io/kierans-lifetrkr/#/

For an application problem, prefer a corrective commit. For an emergency
rollback, first preserve the evidence and identify the last known-good commit,
then create a normal revert and sync it:

```bash
git log --oneline -10
git revert <bad-commit>
npm run sync
```

This preserves published history and lets CI redeploy the reverted state.
`git reset --hard`, branch deletion, and force-push are not part of the normal
recovery procedure.
