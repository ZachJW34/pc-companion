declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string;
      LOG_LEVEL?: string;
    }
  }
}

export {};
