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