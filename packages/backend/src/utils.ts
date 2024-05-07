import { platform as _platform } from "node:os";

const platform = _platform();

export function getPlatform(): "linux" | "mac" | "windows" | "not-supported" {
  switch (platform) {
    case "darwin":
      return "mac";
    case "win32":
      return "windows";
    case "linux":
      return "linux";
    default:
      return "not-supported";
  }
}
