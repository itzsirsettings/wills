import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const serverPort = env.SERVER_PORT || process.env.SERVER_PORT || '3001'
  const plugins = mode === 'development' ? [inspectAttr(), react()] : [react()]

  return {
    base: '/',
    plugins,
    server: {
      proxy: {
        '/api': {
          target: `http://localhost:${serverPort}`,
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              return undefined;
            }

            if (
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('/scheduler/')
            ) {
              return 'react';
            }

            if (id.includes('react-router') || id.includes('@remix-run')) {
              return 'router';
            }

            if (id.includes('zustand') || id.includes('use-sync-external-store')) {
              return 'state';
            }

            if (id.includes('leaflet')) {
              return 'maps';
            }

            if (id.includes('recharts')) {
              return 'charts';
            }

            if (
              id.includes('react-hook-form') ||
              id.includes('@hookform') ||
              id.includes('zod')
            ) {
              return 'forms';
            }

            if (id.includes('motion') || id.includes('framer-motion')) {
              return 'motion';
            }

            if (id.includes('/gsap/')) {
              return 'animation';
            }

            if (id.includes('lucide-react')) {
              return 'icons';
            }

            if (
              id.includes('@radix-ui') ||
              id.includes('embla-carousel-react') ||
              id.includes('sonner') ||
              id.includes('vaul') ||
              id.includes('cmdk') ||
              id.includes('input-otp') ||
              id.includes('react-day-picker') ||
              id.includes('react-resizable-panels') ||
              id.includes('next-themes')
            ) {
              return 'ui';
            }

            if (
              id.includes('class-variance-authority') ||
              id.includes('clsx') ||
              id.includes('tailwind-merge') ||
              id.includes('date-fns')
            ) {
              return 'utils';
            }

            return 'vendor';
          },
        },
      },
    },
  }
});
