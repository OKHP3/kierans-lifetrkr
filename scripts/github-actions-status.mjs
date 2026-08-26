#!/usr/bin/env node
import { ReplitConnectors } from "@replit/connectors-sdk";

const REPO = "OKHP3/kierans-lifetrkr";
const commitSha = process.argv[2];
if (!commitSha || !/^[0-9a-f]{40}$/.test(commitSha)) {
  throw new Error("Usage: github-actions-status.mjs <40-character commit SHA>");
}

const connector = new ReplitConnectors();
const response = await connector.proxy(
  "github",
  `/repos/${REPO}/actions/runs?head_sha=${commitSha}&per_page=20`,
);
const body = await response.json();
if (!response.ok) throw new Error(`GitHub Actions status request failed (${response.status}).`);

const runs = (body.workflow_runs || []).map((run) => ({
  name: run.name,
  status: run.status,
  conclusion: run.conclusion,
  url: run.html_url,
}));
if (runs.length === 0) {
  console.log(`No GitHub Actions run is visible yet for ${commitSha}.`);
} else {
  for (const run of runs) {
    console.log(`${run.name}: ${run.status} (${run.conclusion || "pending"}) ${run.url}`);
  }
}