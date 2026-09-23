import { describe, expect, it } from "vitest";
import { normalizeRequestedPath, resolvePathFromBase } from "./path-utils.js";

describe("normalizeRequestedPath", () => {
  it("strips the leading slash before a drive letter on Windows", () => {
    expect(normalizeRequestedPath("/D:/repo/docs/guide.md", "win32")).toBe("D:/repo/docs/guide.md");
  });

  it("leaves POSIX paths alone on Windows", () => {
    expect(normalizeRequestedPath("/home/test/docs/guide.md", "win32")).toBe(
      "/home/test/docs/guide.md",
    );
    expect(normalizeRequestedPath("docs/guide.md", "win32")).toBe("docs/guide.md");
  });

  it("leaves every path alone off Windows", () => {
    expect(normalizeRequestedPath("/c:/docs/guide.md", "linux")).toBe("/c:/docs/guide.md");
    expect(normalizeRequestedPath("/D:/docs/guide.md", "darwin")).toBe("/D:/docs/guide.md");
  });
});

describe("resolvePathFromBase", () => {
  it.skipIf(process.platform !== "win32")(
    "resolves a POSIX-flavored Windows path to its native form",
    () => {
      expect(resolvePathFromBase("D:\\repo", "/D:/repo/docs/guide.md")).toBe(
        "D:\\repo\\docs\\guide.md",
      );
      expect(resolvePathFromBase("C:\\", "/D:/repo/docs/guide.md")).toBe(
        "D:\\repo\\docs\\guide.md",
      );
    },
  );

  it.skipIf(process.platform !== "win32")("anchors relative paths to the base cwd", () => {
    expect(resolvePathFromBase("D:\\repo", "docs\\guide.md")).toBe("D:\\repo\\docs\\guide.md");
  });

  it.skipIf(process.platform === "win32")("keeps a /c:/... path absolute off Windows", () => {
    expect(resolvePathFromBase("/home/test/project", "/c:/docs/guide.md")).toBe(
      "/c:/docs/guide.md",
    );
  });
});
