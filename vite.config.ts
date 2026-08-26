import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

type ProxyEventEmitter = {
  on: (event: 'error' | 'proxyReq' | 'proxyRes', listener: (...args: any[]) => void) => void
}

declare const process: { cwd: () => string; env: Record<string, string | undefined> }

function logProxyErrors(proxy: unknown, label: string, serverKey?: string) {
  const events = proxy as ProxyEventEmitter
  events.on('proxyReq', (request: { setHeader: (name: string, value: string) => void }) => {
    if (serverKey) request.setHeader('Authorization', `Bearer ${serverKey}`)
    console.info(`[${label} request] forwarding with server key: ${Boolean(serverKey)}`)
  })
  events.on('error', (error: Error, request: { method?: string; url?: string }) => console.error(`[${label} proxy] ${request.method} ${request.url} failed:`, error.message))
  events.on('proxyRes', (response: { statusCode?: number; on: (event: string, listener: (chunk?: unknown) => void) => void }, request: { method?: string; url?: string }) => {
    if ((response.statusCode || 500) < 400) return
    let body = ''
    response.on('data', (chunk) => { body += String(chunk || '') })
    response.on('end', () => console.error(`[${label} upstream] ${request.method} ${request.url} -> ${response.statusCode}:`, body))
  })
  events.on('proxyRes', (response: { statusCode?: number }, request: { method?: string; url?: string }) => {
    if ((response.statusCode || 500) < 400) console.info(`[${label} response] ${request.method} ${request.url} -> ${response.statusCode}`)
  })
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const serverKey = env.GROQ_API_KEY || process.env.GROQ_API_KEY
  return {
  plugins: [react()],
  define: { __AZUREMIND_SERVER_CONFIGURED__: JSON.stringify(Boolean(serverKey)) },
  configureServer(server: any) {
    server.middlewares.use((request: any, _response: any, next: () => void) => {
      if (request.url?.startsWith('/api/')) console.info(`[azuremind api] ${request.method} ${request.url}`)
      next()
    })
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api/azuremind-models': {
        target: 'https://api.groq.com',
        changeOrigin: true,
        headers: { 'Accept-Encoding': 'identity' },
        rewrite: () => '/openai/v1/models',
        configure: (proxy) => logProxyErrors(proxy, 'azuremind models', serverKey),
      },
      '/puter-sdk': {
        target: 'https://js.puter.com',
        changeOrigin: true,
        rewrite: () => '/v2/',
      },
      '/api/azuremind': {
        target: 'https://api.groq.com',
        changeOrigin: true,
        headers: { 'Accept-Encoding': 'identity' },
        rewrite: () => '/openai/v1/chat/completions',
        configure: (proxy) => logProxyErrors(proxy, 'azuremind', serverKey),
      },
    },
  },
  }
})
