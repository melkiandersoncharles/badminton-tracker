/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  /** Supabase project URL — safe to expose in the browser bundle. */
  readonly VITE_SUPABASE_URL?: string
  /** Supabase anon key — designed for client-side use; safe to expose. */
  readonly VITE_SUPABASE_ANON_KEY?: string
  /** Optional local-only dev fallback PIN when Supabase is not configured (public). */
  readonly VITE_GROUP_PIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
