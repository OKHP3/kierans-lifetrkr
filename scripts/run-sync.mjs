import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { delimiter, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function bashPath() {
  if (process.env.SYNC_BASH) return process.env.SYNC_BASH;
  if (process.platform !== "win32") return "bash";
  // Windows' bash.exe alias launches WSL, which may not be installed. Use
  // the Bash distributed with Git for Windows, including portable installs.
  const roots = (process.env.PATH || "").split(delimiter)
    .filter((entry) => existsSync(join(entry, "git.exe")))
    .map((entry) => resolve(entry, ".."));
  for (const base of [process.env.ProgramFiles, process.env["ProgramFiles(x86)"]]) {
    if (base) roots.push(join(base, "Git"));
  }
  if (process.env.LOCALAPPDATA) roots.push(join(process.env.LOCALAPPDATA, "Programs", "Git"));
  for (const root of roots) {
    for (const path of [join(root, "bin", "bash.exe"), join(root, "usr", "bin", "bash.exe")]) {
      if (existsSync(path)) return path;
    }
  }
  throw new Error("Git Bash was not found. Install Git for Windows or set SYNC_BASH to its bash.exe.");
}

export function shellPath(path) {
  return process.platform === "win32" ? path.replaceAll("\\", "/") : path;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const script = join(dirname(fileURLToPath(import.meta.url)), "sync.sh");
  const result = spawnSync(bashPath(), [shellPath(script), ...process.argv.slice(2)], { stdio: "inherit" });
  if (result.error) console.error(result.error.message);
  process.exitCode = result.status ?? 1;
}
