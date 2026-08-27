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

The Replit workspace may also lack a local Git author identity even when the
repository and GitHub connection are otherwise ready; the sync commit must use
a repository-local identity matching the existing project history.

**Why:** The guarded sync cannot create its local checkpoint commit without an
author, and setting identity globally would unnecessarily change the workspace
outside this repository.

**How to apply:** If sync stops at `Author identity unknown`, set local
`user.name` and `user.email` from the latest project commit, then rerun the
guarded sync.