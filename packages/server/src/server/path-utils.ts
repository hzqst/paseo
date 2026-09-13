import { homedir } from "node:os";
import { isAbsolute, posix, resolve, win32 } from "node:path";
import { stripPosixDrivePrefix } from "@getpaseo/protocol/path-utils";

export function assertAbsolutePath(cwd: string): void {
  if (!posix.isAbsolute(cwd) && !win32.isAbsolute(cwd)) {
    throw new Error("cwd must be absolute path");
  }
}

function hasHomePrefix(value: string): boolean {
  return value === "~" || value.startsWith("~/");
}

export function expandUserPath(value: string): string {
  const trimmed = value.trim();
  if (hasHomePrefix(trimmed)) {
    return resolve(homedir(), trimmed.slice(2));
  }
  return resolve(trimmed);
}

/**
 * Clients send absolute Windows paths as `/D:/repo/x` when the path came from a
 * `file://` URL pathname or a `/`-prefixed link. On Windows `isAbsolute` accepts
 * that shape and `resolve` folds it into `C:\D:\repo\x`, which no workspace root
 * can contain. On POSIX `/c:/x` is a real absolute path, so the rewrite is
 * Windows-only.
 */
export function normalizeRequestedPath(
  value: string,
  platform: NodeJS.Platform = process.platform,
): string {
  return platform === "win32" ? stripPosixDrivePrefix(value) : value;
}

export function resolvePathFromBase(baseCwd: string, requestedPath: string): string {
  const trimmed = normalizeRequestedPath(requestedPath.trim());
  if (hasHomePrefix(trimmed) || isAbsolute(trimmed)) {
    return expandUserPath(trimmed);
  }
  return resolve(baseCwd, trimmed);
}

export function isSameOrDescendantPath(basePath: string, candidatePath: string): boolean {
  let normalizedBase = basePath.replace(/\\/g, "/").replace(/\/$/, "");
  let normalizedCandidate = candidatePath.replace(/\\/g, "/").replace(/\/$/, "");

  if (/^[a-zA-Z]:\//.test(normalizedBase) || /^[a-zA-Z]:\//.test(normalizedCandidate)) {
    normalizedBase = normalizedBase.toLowerCase();
    normalizedCandidate = normalizedCandidate.toLowerCase();
  }

  return (
    normalizedCandidate === normalizedBase || normalizedCandidate.startsWith(normalizedBase + "/")
  );
}
