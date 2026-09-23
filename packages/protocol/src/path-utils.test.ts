import { describe, expect, it } from "vitest";
import { stripCwdPrefix, stripPosixDrivePrefix } from "./path-utils.js";

describe("stripPosixDrivePrefix", () => {
  it("drops the leading slash before a drive letter", () => {
    expect(stripPosixDrivePrefix("/D:/repo/docs/guide.md")).toBe("D:/repo/docs/guide.md");
    expect(stripPosixDrivePrefix("/c:/repo/docs/guide.md")).toBe("c:/repo/docs/guide.md");
  });

  it("drops the leading slash before a drive letter with backslashes", () => {
    expect(stripPosixDrivePrefix("/D:\\repo\\docs\\guide.md")).toBe("D:\\repo\\docs\\guide.md");
  });

  it("leaves the native drive-letter form alone", () => {
    expect(stripPosixDrivePrefix("D:/repo/docs/guide.md")).toBe("D:/repo/docs/guide.md");
  });

  it("leaves POSIX absolute paths alone", () => {
    expect(stripPosixDrivePrefix("/home/test/repo/docs/guide.md")).toBe(
      "/home/test/repo/docs/guide.md",
    );
    expect(stripPosixDrivePrefix("/tmp/guide.md")).toBe("/tmp/guide.md");
    expect(stripPosixDrivePrefix("/")).toBe("/");
  });

  it("leaves UNC paths alone", () => {
    expect(stripPosixDrivePrefix("//server/share/guide.md")).toBe("//server/share/guide.md");
  });

  it("leaves a single-character non-letter segment alone", () => {
    expect(stripPosixDrivePrefix("/1:/guide.md")).toBe("/1:/guide.md");
  });
});

describe("stripCwdPrefix", () => {
  it("returns the path relative to the cwd", () => {
    expect(stripCwdPrefix("/tmp/repo/src/index.ts", "/tmp/repo")).toBe("src/index.ts");
    expect(stripCwdPrefix("/tmp/repo", "/tmp/repo")).toBe(".");
  });

  it("returns the path unchanged when it is outside the cwd", () => {
    expect(stripCwdPrefix("/tmp/other/index.ts", "/tmp/repo")).toBe("/tmp/other/index.ts");
    expect(stripCwdPrefix("/tmp/repo/src/index.ts")).toBe("/tmp/repo/src/index.ts");
  });
});
