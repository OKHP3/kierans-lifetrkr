import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { once } from "node:events";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const projectRoot = join(import.meta.dirname, "..");
const syncScript = join(projectRoot, "scripts", "sync.sh");
const publishScript = join(projectRoot, "scripts", "github-api-publish.mjs");

function git(cwd, ...args) {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_CONFIG_NOSYSTEM: "1",
      GIT_CONFIG_GLOBAL: "/dev/null",
    },
  }).trim();
}

function configureRepo(cwd) {
  git(cwd, "config", "user.name", "Sync Regression Test");
  git(cwd, "config", "user.email", "sync-regression@example.invalid");
}

async function createFixture() {
  const root = await mkdtemp(join(tmpdir(), "lifetrkr-sync-"));
  const local = join(root, "local");
  const remote = join(root, "remote.git");
  await mkdir(local);
  execFileSync("git", ["init", "--bare", remote], { encoding: "utf8" });
  execFileSync("git", ["init", "--initial-branch=main", local], { encoding: "utf8" });
  configureRepo(local);
  await writeFile(join(local, "README.md"), "base\n");
  await writeFile(join(local, "remove.txt"), "remove me\n");
  git(local, "add", "README.md", "remove.txt");
  git(local, "commit", "-m", "base");
  git(local, "remote", "add", "origin", remote);
  git(local, "push", "--set-upstream", "origin", "main");
  git(local, "fetch", "origin", "main");

  const hookLog = join(remote, "hooks", "receive.log");
  const hook = `#!/bin/sh\ncat >> ${JSON.stringify(hookLog)}\n`;
  await writeFile(join(remote, "hooks", "pre-receive"), hook, { mode: 0o755 });
  await writeFile(hookLog, "");

  return { root, local, remote, hookLog };
}

async function cleanupFixture(fixture) {
  await rm(fixture.root, { recursive: true, force: true });
}

function clearHookLog(fixture) {
  execFileSync("truncate", ["-s", "0", fixture.hookLog]);
}

async function createRemoteCommit(fixture, name, contents) {
  const clone = await mkdtemp(join(fixture.root, "remote-writer-"));
  execFileSync("git", ["clone", "--quiet", "--branch", "main", fixture.remote, clone], { encoding: "utf8" });
  configureRepo(clone);
  await writeFile(join(clone, name), contents);
  git(clone, "add", name);
  git(clone, "commit", "-m", `remote: ${name}`);
  git(clone, "push", "origin", "main");
  await rm(clone, { recursive: true, force: true });
}

function runSync(fixture, extraEnv = {}) {
  const result = spawnSync("bash", [syncScript], {
    cwd: fixture.local,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_CONFIG_NOSYSTEM: "1",
      GIT_CONFIG_GLOBAL: "/dev/null",
      SYNC_TEST_MODE: "1",
      SYNC_REPO: "test/local",
      SYNC_ORIGIN_URL: fixture.remote,
      SYNC_CHECK_COMMAND: "true",
      SYNC_SKIP_ACTIONS_STATUS: "1",
      ...extraEnv,
    },
  });
  return {
    ...result,
    output: `${result.stdout || ""}${result.stderr || ""}`,
  };
}

function remoteSha(fixture) {
  return git(fixture.remote, "rev-parse", "refs/heads/main");
}

function localSha(fixture) {
  return git(fixture.local, "rev-parse", "main");
}

function assertSyncStopped(result, message) {
  assert.notEqual(result.status, 0, message);
  assert.equal(result.signal, null, `${message}: process was terminated`);
}

test("clean repository does not publish or move refs", async (t) => {
  const fixture = await createFixture();
  t.after(() => cleanupFixture(fixture));
  const before = localSha(fixture);

  const result = runSync(fixture);

  assert.equal(result.status, 0, result.output);
  assert.equal(localSha(fixture), before);
  assert.equal(remoteSha(fixture), before);
  assert.equal((await readFile(fixture.hookLog, "utf8")).trim(), "");
});

test("local-ahead repository pushes without force", async (t) => {
  const fixture = await createFixture();
  t.after(() => cleanupFixture(fixture));
  await writeFile(join(fixture.local, "local.txt"), "local\n");
  git(fixture.local, "add", "local.txt");
  git(fixture.local, "commit", "-m", "local ahead");
  const expected = localSha(fixture);
  clearHookLog(fixture);

  const result = runSync(fixture);

  assert.equal(result.status, 0, result.output);
  assert.equal(remoteSha(fixture), expected);
  assert.match(await readFile(fixture.hookLog, "utf8"), /refs\/heads\/main/);
});

test("remote-ahead repository fast-forwards locally without publishing", async (t) => {
  const fixture = await createFixture();
  t.after(() => cleanupFixture(fixture));
  await createRemoteCommit(fixture, "remote.txt", "remote\n");
  clearHookLog(fixture);
  const expected = remoteSha(fixture);

  const result = runSync(fixture);

  assert.equal(result.status, 0, result.output);
  assert.equal(localSha(fixture), expected);
  assert.equal(remoteSha(fixture), expected);
  assert.equal((await readFile(fixture.hookLog, "utf8")).trim(), "");
});

test("divergent non-conflicting histories rebase and preserve both trees", async (t) => {
  const fixture = await createFixture();
  t.after(() => cleanupFixture(fixture));
  await writeFile(join(fixture.local, "local.txt"), "local\n");
  git(fixture.local, "add", "local.txt");
  git(fixture.local, "commit", "-m", "local change");
  await createRemoteCommit(fixture, "remote.txt", "remote\n");
  clearHookLog(fixture);

  const result = runSync(fixture);

  assert.equal(result.status, 0, result.output);
  assert.equal(localSha(fixture), remoteSha(fixture));
  assert.equal(git(fixture.local, "show", "HEAD:local.txt"), "local");
  assert.equal(git(fixture.local, "show", "HEAD:remote.txt"), "remote");
  assert.match(await readFile(fixture.hookLog, "utf8"), /refs\/heads\/main/);
});

test("wrong branch stops before fetch, ref update, or push", async (t) => {
  const fixture = await createFixture();
  t.after(() => cleanupFixture(fixture));
  const before = localSha(fixture);
  git(fixture.local, "switch", "-c", "feature");
  clearHookLog(fixture);

  const result = runSync(fixture);

  assertSyncStopped(result, "wrong branch should be rejected");
  assert.match(result.output, /checked out branch is not 'main'/);
  assert.equal(localSha(fixture), before);
  assert.equal(remoteSha(fixture), before);
  assert.equal((await readFile(fixture.hookLog, "utf8")).trim(), "");
});

test("credential-bearing origin stops before any remote operation", async (t) => {
  const fixture = await createFixture();
  t.after(() => cleanupFixture(fixture));
  const before = localSha(fixture);
  git(fixture.local, "remote", "set-url", "origin", "https://test-user:secret@example.invalid/test/local.git");
  clearHookLog(fixture);

  const result = runSync(fixture);

  assertSyncStopped(result, "credential-bearing origin should be rejected");
  assert.match(result.output, /origin contains embedded credentials/);
  assert.equal(localSha(fixture), before);
  assert.equal(remoteSha(fixture), before);
  assert.equal((await readFile(fixture.hookLog, "utf8")).trim(), "");
});

test("conflicting histories abort rebase without publishing", async (t) => {
  const fixture = await createFixture();
  t.after(() => cleanupFixture(fixture));
  await writeFile(join(fixture.local, "README.md"), "local conflict\n");
  git(fixture.local, "add", "README.md");
  git(fixture.local, "commit", "-m", "local conflict");
  const before = localSha(fixture);
  await createRemoteCommit(fixture, "README.md", "remote conflict\n");
  const remoteBefore = remoteSha(fixture);
  clearHookLog(fixture);

  const result = runSync(fixture);

  assertSyncStopped(result, "conflicting history should be rejected");
  assert.match(result.output, /Rebase conflict detected/);
  assert.equal(localSha(fixture), before);
  assert.equal(remoteSha(fixture), remoteBefore);
  assert.equal((await readFile(fixture.hookLog, "utf8")).trim(), "");
  assert.equal(git(fixture.local, "status", "--porcelain"), "");
});

function shaFor(label) {
  return createHash("sha1").update(label).digest("hex");
}

async function filesAtCommit(cwd, sha) {
  const files = new Map();
  const names = git(cwd, "ls-tree", "-r", "--name-only", sha).split("\n").filter(Boolean);
  for (const name of names) {
    files.set(name, execFileSync("git", ["show", `${sha}:${name}`], { cwd, encoding: "utf8" }));
  }
  return files;
}

async function startGitHubApiMock({ baseSha, baseFiles, race = false }) {
  const publishedSha = shaFor("published-commit");
  const publishedTreeSha = shaFor("published-tree");
  const competingSha = shaFor("competing-remote");
  const state = {
    refSha: baseSha,
    baseFiles: new Map(baseFiles),
    treeFiles: null,
    blobs: new Map(),
    treePayload: null,
    commitPayload: null,
    patchPayload: null,
    publishedSha,
    publishedTreeSha,
    competingSha,
    refReads: 0,
  };

  const send = (response, status, body) => {
    response.writeHead(status, { "content-type": "application/json" });
    response.end(JSON.stringify(body));
  };
  const bodyOf = async (request) => {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  };
  const server = createServer(async (request, response) => {
    try {
      const path = request.url;
      if (request.method === "GET" && path === "/repos/test/local/git/ref/heads/main") {
        state.refReads += 1;
        send(response, 200, { object: { sha: baseSha } });
        if (race) state.refSha = competingSha;
        return;
      }
      if (request.method === "GET" && path === `/repos/test/local/git/commits/${baseSha}`) {
        send(response, 200, { tree: { sha: "base-tree" } });
        return;
      }
      if (request.method === "POST" && path === "/repos/test/local/git/blobs") {
        const body = await bodyOf(request);
        const content = Buffer.from(body.content, body.encoding).toString("utf8");
        const sha = shaFor(`blob:${content}`);
        state.blobs.set(sha, content);
        send(response, 201, { sha });
        return;
      }
      if (request.method === "POST" && path === "/repos/test/local/git/trees") {
        const body = await bodyOf(request);
        state.treePayload = body;
        const files = new Map(state.baseFiles);
        for (const entry of body.tree) {
          if (entry.sha === null) files.delete(entry.path);
          else files.set(entry.path, state.blobs.get(entry.sha));
        }
        state.treeFiles = files;
        send(response, 201, { sha: publishedTreeSha });
        return;
      }
      if (request.method === "POST" && path === "/repos/test/local/git/commits") {
        state.commitPayload = await bodyOf(request);
        send(response, 201, { sha: publishedSha });
        return;
      }
      if (request.method === "PATCH" && path === "/repos/test/local/git/refs/heads/main") {
        state.patchPayload = await bodyOf(request);
        if (state.patchPayload.force !== false || state.refSha !== baseSha) {
          send(response, 422, { message: "Update is not a fast-forward" });
          return;
        }
        state.refSha = state.patchPayload.sha;
        send(response, 200, { object: { sha: state.refSha } });
        return;
      }
      send(response, 404, { message: "not found" });
    } catch (error) {
      send(response, 500, { message: error.message });
    }
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address();
  return {
    state,
    baseUrl: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())),
  };
}

async function runApiPublish(fixture, localCommit, baseUrl) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [publishScript, localCommit], {
      cwd: fixture.local,
      env: {
        ...process.env,
        GIT_CONFIG_NOSYSTEM: "1",
        GIT_CONFIG_GLOBAL: "/dev/null",
        GITHUB_API_PUBLISH_TEST_MODE: "1",
        GITHUB_API_PUBLISH_REPO: "test/local",
        GITHUB_API_PUBLISH_BASE_URL: baseUrl,
      },
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("close", (status, signal) => resolve({ status, signal, stdout, stderr }));
  });
}

test("GitHub API fallback publishes the final tree with a non-force update", async (t) => {
  const fixture = await createFixture();
  t.after(() => cleanupFixture(fixture));
  await writeFile(join(fixture.local, "changed.txt"), "changed\n");
  await writeFile(join(fixture.local, "README.md"), "updated base\n");
  git(fixture.local, "mv", "remove.txt", "renamed.txt");
  git(fixture.local, "add", "changed.txt", "README.md");
  git(fixture.local, "commit", "-m", "api publish");
  const localCommit = localSha(fixture);
  const baseCommit = git(fixture.local, "rev-parse", "origin/main");
  const baseFiles = await filesAtCommit(fixture.local, baseCommit);
  const mock = await startGitHubApiMock({ baseSha: baseCommit, baseFiles });
  t.after(() => mock.close());

  const result = await runApiPublish(fixture, localCommit, mock.baseUrl);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(mock.state.refSha, mock.state.publishedSha);
  assert.equal(mock.state.patchPayload.force, false);
  assert.deepEqual(mock.state.commitPayload.parents, [baseCommit]);
  assert.equal(mock.state.commitPayload.tree, mock.state.publishedTreeSha);
  assert.deepEqual(Object.fromEntries(mock.state.treeFiles), Object.fromEntries(await filesAtCommit(fixture.local, localCommit)));
});

test("GitHub API fallback refuses a ref race without updating the ref", async (t) => {
  const fixture = await createFixture();
  t.after(() => cleanupFixture(fixture));
  await writeFile(join(fixture.local, "changed.txt"), "changed\n");
  git(fixture.local, "add", "changed.txt");
  git(fixture.local, "commit", "-m", "api race");
  const localCommit = localSha(fixture);
  const baseCommit = git(fixture.local, "rev-parse", "origin/main");
  const baseFiles = await filesAtCommit(fixture.local, baseCommit);
  const mock = await startGitHubApiMock({ baseSha: baseCommit, baseFiles, race: true });
  t.after(() => mock.close());

  const result = await runApiPublish(fixture, localCommit, mock.baseUrl);

  assert.notEqual(result.status, 0);
  assert.equal(mock.state.refReads, 1);
  assert.equal(mock.state.patchPayload.force, false);
  assert.equal(mock.state.refSha, mock.state.competingSha);
  assert.notEqual(mock.state.refSha, mock.state.publishedSha);
});