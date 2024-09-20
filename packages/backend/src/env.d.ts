import type { LogLevel } from "./utils";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string;
      LOG_LEVEL?: LogLevel | undefined;
    }
  }
}

export {};
