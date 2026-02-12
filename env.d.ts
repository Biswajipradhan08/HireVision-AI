/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_CASHFREE_APP_ID: string;
  readonly VITE_CASHFREE_SECRET_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
