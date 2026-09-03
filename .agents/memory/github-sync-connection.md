---
name: GitHub sync transport
description: Replit GitHub connection behavior relevant to safe repository synchronization
---

The bound Replit GitHub connection authorizes authenticated REST API access but
does not automatically authenticate Git's HTTPS transport. A credential-free
canonical `origin` can therefore fetch public repositories while `git push`
fails with an authentication error.

**Why:** Keeping an OAuth token embedded in `.git/config` would expose a
credential through local configuration and history. The GitHub API can publish
with the connection's server-side credential without storing that token.

**How to apply:** Keep `origin` as the public repository URL, fetch before
every sync, compare the remote ref with the expected base, and use a
`force: false` GitHub API ref update only as a fallback when Git transport
authentication is unavailable. Fetch the resulting public commit back and
compare trees before aligning local refs.

GitHub classic personal access tokens are revoked from the token owner's
GitHub Settings → Developer settings → Personal access tokens. The bound
Replit GitHub connection cannot revoke a separate classic PAT.

**Why:** The connection proxy supplies its own OAuth credential and does not
expose the client secret or token-management authority required to revoke an
unrelated personal access token.

**How to apply:** If a classic PAT appears in a remote URL, normalize the
remote immediately, then have the owner delete the PAT before any further
source-control operation. Never copy the exposed value into a new secret or
remote.

The Replit workspace may also lack a local Git author identity even when the
repository and GitHub connection are otherwise ready; the sync commit must use
a repository-local identity matching the existing project history.

**Why:** The guarded sync cannot create its local checkpoint commit without an
author, and setting identity globally would unnecessarily change the workspace
outside this repository.

**How to apply:** If sync stops at `Author identity unknown`, set local
`user.name` and `user.email` from the latest project commit, then rerun the
guarded sync.

When a documentation-only remote child has advanced from the shared base while
validated application commits remain local, the guarded rebase may stop on
semantic conflicts. Preserve a local backup ref, review the remote delta, and
use an explicit non-force merge only when the newer validated tree intentionally
supersedes the stale wording; then rerun the guarded sync and fetch the result.

**Why:** Squashed evidence updates can share a base without sharing the later
application and release-record history. Silent conflict resolution can discard
newer evidence or product changes.

**How to apply:** Treat the aborted rebase as a stop signal, not a reason to
force-push or reset. Keep both histories reachable until the merged tree and
post-publish checks are verified.

When a remote main has a stale or parallel release lineage, a tip-only
dependency update may also carry deletions of project-specific validation
scripts from its own parent history. Do not cherry-pick or accept that tip
blindly; simulate the merge and review package, scripts, and release-document
conflicts together.

**Why:** A clean local tree can still be far ahead in validated product and
evidence work while the remote branch contains older provenance that Git cannot
reconcile by commit order alone.

**How to apply:** Prefer an explicit non-force merge after preserving both refs,
keep the newer validated local behavior unless the remote change is intentionally
required, selectively retain remote-only provenance, then run the full release
checks before publishing.

The Replit GitHub proxy can return 404 for Git tree entries below
`.github/workflows` even when the bound connection has repository admin/push
access; the direct GitHub API accepts the same entries.

**Why:** This is a connector route restriction, not repository visibility or
OAuth failure, so reauthorization and force-pushes do not solve it.

**How to apply:** Keep the bound connector as the first publication path, then
use an in-memory `GITHUB_PAT` API fallback only for the rejected request. Retain
the compare-and-swap ref check and fetch the published tree back before aligning
local refs.

Release records must keep source/build evidence separate from owner-controlled
account, device, deployment, and manual validation evidence. When parallel
histories disagree, preserve the narrower evidence tier and the explicit owner
gate rather than upgrading an older candidate's claim.

**Why:** A rebase can make stale historical wording appear current, especially
when publication and ownership records were written for a different commit.

**How to apply:** Reconcile release identity and decision wording against the
actual tree and freshly observed checks, while leaving historical candidate
hashes and unrun owner checks clearly bounded.
