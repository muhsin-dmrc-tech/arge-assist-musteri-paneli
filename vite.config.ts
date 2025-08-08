import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import tailwindcss from 'tailwindcss';

export default defineConfig(({ mode }) => {
  // Ortam değişkenlerini yükle
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    css: {
      postcss: {
        plugins: [tailwindcss()]
      }
    },
    base: '/',
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    optimizeDeps: {
      include: ['pdfjs-dist','hoist-non-react-statics']
    },
    build: {
      chunkSizeWarningLimit: 4000,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            vendor: ['axios', 'lodash']
          }
        }
      }
    },
    server: {
      proxy: {
        '/auth': {
          target: env.VITE_FRONTENT_URL ?? 'http://localhost:5173',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/auth/, '')
        }
      },
      historyApiFallback: {
        disableDotRule: true
      }
    }
  };
});