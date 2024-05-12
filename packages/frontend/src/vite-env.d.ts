/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_WS_URL: string;
  readonly VITE_LOG_LEVEL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
