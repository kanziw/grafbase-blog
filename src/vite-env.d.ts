/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GRAFBASE_API_URL: string
  readonly VITE_GRAFBASE_PUBLIC_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
