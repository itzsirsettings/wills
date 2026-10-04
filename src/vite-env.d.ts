/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TURNSTILE_SITE_KEY?: string;
  readonly VITE_BUSINESS_EMAIL?: string;
  readonly VITE_BUSINESS_PHONE?: string;
  readonly VITE_BUSINESS_WHATSAPP?: string;
  readonly VITE_BUSINESS_ADDRESS?: string;
  readonly VITE_PUBLIC_SITE_URL?: string;
  readonly VITE_WORKSHOP_LATITUDE?: string;
  readonly VITE_WORKSHOP_LONGITUDE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
