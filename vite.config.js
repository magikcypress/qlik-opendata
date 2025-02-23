import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('qlik-embed') // Ignore tous les éléments Qlik
        }
      }
    }),
    vueDevTools(),
    viteStaticCopy({
      targets: [
        {
          src: path.resolve('./oauth-callback.html'), // Chemin vers le fichier que vous voulez copier
          dest: '' // Copier à la racine du répertoire de build
        }
      ]
    })
  ],
  optimizeDeps: {
    exclude: ['chunk-PZ5AY32C'] // Ajoutez ici la dépendance problématique
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  define: {
    'process.env': {}
  },
  base: "./",
  build: {
    chunkSizeWarningLimit: 1600,
    outDir: "dist"
  },
  server: {
    host: '0.0.0.0',
    port: 8081,
    headers: {
      "Cache-Control": "max-age=31536000, immutable"
    }
  },
  // devServer: {
  // 	https: {
  // 		key: fs.readFileSync('./certs/dory-eel.ts.net+5-key.pem'),
  // 		cert: fs.readFileSync('./certs/dory-eel.ts.net+5.pem'),
  // 	},
  // 	public: 'https://localhost:4443/'
  // },
  // hmr: {
  // 	protocol: 'ws',
  // 	host: 'localhost',
  // },
  test: {
    // active les API compatibles avec jest globalement
    globals: true,
    // simule le DOM avec happy-dom
    // (requiert l'installation de happy-dom en dépendance additionnelle)
    environment: 'happy-dom'
  }
})