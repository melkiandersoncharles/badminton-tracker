import type { IncomingMessage, ServerResponse } from 'node:http'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { adminVerifyGetResponse, adminVerifyPostResponse } from './api/admin-verify-logic.js'

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => {
      if (!data) {
        resolve({})
        return
      }
      try {
        resolve(JSON.parse(data))
      } catch {
        reject(new Error('Invalid JSON'))
      }
    })
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      {
        name: 'admin-verify-dev-api',
        configureServer(server) {
          server.middlewares.use('/api/admin-verify', (req, res, next) => {
            const prev = process.env.ADMIN_PIN
            process.env.ADMIN_PIN = env.ADMIN_PIN ?? prev

            void (async () => {
              try {
                if (req.method === 'GET') {
                  sendJson(res, 200, adminVerifyGetResponse())
                  return
                }
                if (req.method === 'POST') {
                  const body = await readJsonBody(req)
                  sendJson(res, 200, adminVerifyPostResponse(body))
                  return
                }
                sendJson(res, 405, { error: 'Method not allowed' })
              } catch {
                sendJson(res, 400, { error: 'Bad request' })
              } finally {
                if (prev === undefined) {
                  delete process.env.ADMIN_PIN
                } else {
                  process.env.ADMIN_PIN = prev
                }
              }
            })().catch(next)
          })
        },
      },
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'pwa-192.png', 'pwa-512.png'],
        manifest: {
          name: 'Badminton Tracker',
          short_name: 'Shuttle',
          description: 'Daily doubles on two courts — scores, attendance, board',
          theme_color: '#0c1f18',
          background_color: '#0c1f18',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          icons: [
            {
              src: 'pwa-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'pwa-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          navigateFallback: '/index.html',
          cleanupOutdatedCaches: true,
        },
      }),
    ],
  }
})
