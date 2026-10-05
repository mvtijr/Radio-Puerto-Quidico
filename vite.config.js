import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

import fs from 'fs'

function remoteConfigApiPlugin() {
  return {
    name: 'remote-config-api',
    configureServer(server) {
      server.middlewares.use('/api/remote-config', (req, res, next) => {
        const filePath = path.resolve(__dirname, 'public/radio-remote-config.json');

        if (req.method === 'GET') {
          try {
            if (fs.existsSync(filePath)) {
              const content = fs.readFileSync(filePath, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
              res.end(content);
              return;
            }
          } catch (e) {}
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'File not found' }));
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          let size = 0;
          const MAX_SIZE = 512 * 1024; // Límite estricto de 512 KB para evitar saturación de memoria DoS
          let isTooLarge = false;

          req.on('data', chunk => {
            size += chunk.length;
            if (size > MAX_SIZE) {
              isTooLarge = true;
              res.statusCode = 413;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Payload demasiado grande. Límite: 512 KB.' }));
              req.destroy();
              return;
            }
            body += chunk;
          });

          req.on('end', () => {
            if (isTooLarge) return;
            try {
              if (!body || body.trim() === '') {
                throw new Error('Cuerpo de la solicitud vacío');
              }
              const data = JSON.parse(body);
              if (!data || typeof data !== 'object' || Array.isArray(data)) {
                throw new Error('Estructura de datos inválida. Debe ser un objeto JSON de configuración.');
              }

              data.updatedAt = new Date().toISOString();
              fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, updatedAt: data.updatedAt }));
            } catch (err) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    remoteConfigApiPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
