import { platform as _platform } from "node:os";

const platform = _platform();

export const LOG_PRIORITY = ["INFO", "DEBUG"] as const;

export type LogLevel = (typeof LOG_PRIORITY)[number];

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

function logger(callerLogLevel: LogLevel, ...messages: any) {
  const logLevelEnv = process.env.LOG_LEVEL || "INFO";

  const envIdx = LOG_PRIORITY.indexOf(logLevelEnv);
  const callerIdx = LOG_PRIORITY.indexOf(callerLogLevel);

  if (envIdx >= callerIdx) {
    console.log(...messages);
  }
}

export function createLogger(tag: string) {
  const fn =
    (level: LogLevel) =>
    (...messages: any) =>
      logger(level, `[${tag}]: `, ...messages);

  return {
    info: fn("INFO"),
    debug: fn("DEBUG"),
  };
}

export class JsonResponse extends Response {
  constructor(...args: ConstructorParameters<typeof Response>) {
    super(...args);
    this.headers.set("Content-Type", "application/json");
  }
}
