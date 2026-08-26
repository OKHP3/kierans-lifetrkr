#!/usr/bin/env node
/**
 * Publish one already-validated local commit through the bound Replit GitHub
 * connection when the local Git transport has no credential helper.
 *
 * This is intentionally a compare-and-swap operation: the GitHub ref must
 * still point to the local commit's parent and force updates are never used.
 */
import { execFileSync } from "node:child_process";
import { ReplitConnectors } from "@replit/connectors-sdk";

const REPO = "OKHP3/kierans-lifetrkr";
const commitSha = process.argv[2];

if (!commitSha || !/^[0-9a-f]{40}$/.test(commitSha)) {
  throw new Error("Usage: github-api-publish.mjs <40-character commit SHA>");
}

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trimEnd();
const metadata = git(
  "show",
  "-s",
  "--format=%an%x00%ae%x00%aI%x00%cn%x00%ce%x00%cI%x00%B",
  commitSha,
).split("\0");
const [authorName, authorEmail, authorDate, committerName, committerEmail, committerDate, ...messageParts] = metadata;
const message = messageParts.join("\0").trimEnd();

const connector = new ReplitConnectors();
const api = async (path, options = {}) => {
  const response = await connector.proxy("github", path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = {};
  }
  if (!response.ok) {
    throw new Error(`GitHub API request failed (${response.status}) at ${path}: ${body.message || "request rejected"}`);
  }
  return body;
};

const expectedParent = git("rev-parse", "origin/main");
const ref = await api(`/repos/${REPO}/git/ref/heads/main`);
const parentSha = ref.object?.sha;
if (parentSha !== expectedParent) {
  throw new Error("origin/main changed during publication; no update was attempted.");
}
const changed = git("diff-tree", "--no-commit-id", "--name-status", "-r", "-M", "-z", parentSha, commitSha)
  .split("\0")
  .filter(Boolean);
const parentCommit = await api(`/repos/${REPO}/git/commits/${parentSha}`);
const entries = [];

const addFile = async (path) => {
  const content = execFileSync("git", ["show", `${commitSha}:${path}`]);
  const treeLine = git("ls-tree", commitSha, "--", path);
  const mode = treeLine.split(/\s+/, 1)[0] || "100644";
  const blob = await api(`/repos/${REPO}/git/blobs`, {
    method: "POST",
    body: JSON.stringify({ content: content.toString("base64"), encoding: "base64" }),
  });
  entries.push({ path, mode, type: "blob", sha: blob.sha });
};

for (let index = 0; index < changed.length;) {
  const record = changed[index++];
  const status = record[0];
  if (status === "R" || status === "C") {
    const oldPath = changed[index++];
    const newPath = changed[index++];
    if (status === "R") entries.push({ path: oldPath, mode: "100644", type: "blob", sha: null });
    await addFile(newPath);
  } else {
    const path = record.length === 1 ? changed[index++] : record.slice(1);
    if (status === "D") {
      entries.push({ path, mode: "100644", type: "blob", sha: null });
    } else {
      await addFile(path);
    }
  }
}

const tree = await api(`/repos/${REPO}/git/trees`, {
  method: "POST",
  body: JSON.stringify({ base_tree: parentCommit.tree.sha, tree: entries }),
});
const commit = await api(`/repos/${REPO}/git/commits`, {
  method: "POST",
  body: JSON.stringify({
    message,
    tree: tree.sha,
    parents: [parentSha],
    author: { name: authorName, email: authorEmail, date: authorDate },
    committer: { name: committerName, email: committerEmail, date: committerDate },
  }),
});
const updated = await api(`/repos/${REPO}/git/refs/heads/main`, {
  method: "PATCH",
  body: JSON.stringify({ sha: commit.sha, force: false }),
});

console.log(JSON.stringify({
  localSha: commitSha,
  publishedSha: commit.sha,
  refSha: updated.object?.sha,
  parentSha,
}));