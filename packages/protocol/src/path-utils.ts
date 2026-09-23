/**
 * Drops the leading slash a POSIX-flavored Windows path arrives with, so
 * `/D:/repo/file.ts` becomes `D:/repo/file.ts`.
 *
 * `file://` URL pathnames and `/`-prefixed links both carry that shape, and Node
 * accepts it as absolute on Windows — but only the drive-letter form is a path
 * the daemon and the file explorer can resolve.
 */
export function stripPosixDrivePrefix(filePath: string): string {
  return /^\/[A-Za-z]:[\\/]/.test(filePath) ? filePath.slice(1) : filePath;
}

export function stripCwdPrefix(filePath: string, cwd?: string): string {
  if (!cwd || !filePath) {
    return filePath;
  }

  const normalizedCwd = cwd.replace(/\\/g, "/").replace(/\/+$/, "");
  const normalizedPath = filePath.replace(/\\/g, "/");
  const prefix = `${normalizedCwd}/`;

  if (normalizedPath.startsWith(prefix)) {
    return normalizedPath.slice(prefix.length);
  }
  if (normalizedPath === normalizedCwd) {
    return ".";
  }
  return filePath;
}
