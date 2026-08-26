import { Component, useEffect, useState } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { Bell, HelpCircle, Menu, PanelLeftClose, Settings2 } from 'lucide-react'
import { AccountPanel } from './components/AccountPanel'
import { ChatArea } from './components/ChatArea'
import { OfflineBanner } from './components/OfflineBanner'
import { OnboardingPanel } from './components/OnboardingPanel'
import { Sidebar } from './components/Sidebar'
import { SettingsPanel } from './components/SettingsPanel'
import type { AttachmentPayload, AzuremindVersion, Conversation, EffortLevel, Message } from './types'

const STORAGE_KEY = 'azuremind-conversations'
const API_KEY_STORAGE = 'azuremind-groq-key'
const ACCOUNT_STORAGE = 'azuremind-account'
const MODEL_CANDIDATES = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.6-27b', 'openai/gpt-oss-safeguard-20b']
const VISION_MODEL_CANDIDATES = ['qwen/qwen3.6-27b']
const MODEL_BY_VERSION: Record<AzuremindVersion, string> = { '1.0': 'openai/gpt-oss-safeguard-20b', '1.1': 'openai/gpt-oss-120b', '1.2': 'qwen/qwen3.6-27b', '2.0': 'openai/gpt-oss-20b', dev: 'openai/gpt-oss-120b' }
const CODE_MODEL_BY_VERSION: Record<AzuremindVersion, string> = { '1.0': 'qwen/qwen3.6-27b', '1.1': 'openai/gpt-oss-120b', '1.2': 'openai/gpt-oss-20b', '2.0': 'qwen/qwen3.6-27b', dev: 'openai/gpt-oss-120b' }
const BETA_TESTER_EMAILS = ['chopp2979@inst.hcpss.org']
const DEVELOPER_EMAILS = ['owall4229@inst.hcpss.org']
const effortDescriptions: Record<EffortLevel, string> = { Extra: 'Be thorough but focused. Use concise reasoning summaries, not private chain-of-thought. Keep the answer under 700 words unless the user asks for detail.', High: 'Be clear and useful but concise. Keep the answer under 450 words unless the user asks for detail.', Normal: 'Give a concise, direct answer, normally under 250 words.', Low: 'Give only the direct answer, normally under 120 words.' }
const identityPrompt = 'You are Cobalt AI, an independent AI application. You are not made by, owned by, or developed by Microsoft, Azure, OpenAI, or Groq. Do not invent a company origin, parameter count, training data, knowledge cutoff, compliance certification, or product architecture. When asked about your identity, say you are Cobalt AI running on a configured language model service, and clearly distinguish Cobalt AI from the underlying provider model.'

function formatTime(date = new Date()) { return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
function readConversations(): Conversation[] { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] } }
function accessForEmail(email: string) {
  const normalized = email.trim().toLowerCase()
  const isDeveloper = DEVELOPER_EMAILS.includes(normalized)
  const isBetaTester = isDeveloper || BETA_TESTER_EMAILS.includes(normalized)
  return { isBetaTester, isDeveloper }
}

export class AppErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('[Azuremind startup]', error, info.componentStack) }
  render() {
    if (!this.state.error) return this.props.children
    return <div className="runtime-error"><div className="runtime-error-mark cobalt-mark">C<span /></div><p className="eyebrow">COBALT AI WORKSPACE</p><h1>Workspace could not load</h1><p>Refresh the page to try again. If the problem continues, open the browser console for the startup error.</p><button onClick={() => window.location.reload()}>Refresh workspace</button></div>
  }
}
async function discoverModels(apiKey: string): Promise<string[]> {
  const headers: HeadersInit = apiKey ? { Authorization: `Bearer ${apiKey}` } : {}
  const response = await fetch('/api/azuremind-models', { headers })
  if (!response.ok) throw new Error(`Model discovery failed (${response.status})`)
  const data = await response.json() as { data?: { id?: string }[] }
  const available = (data.data || []).map((model) => model.id).filter((id): id is string => Boolean(id))
  const preferred = MODEL_CANDIDATES.filter((candidate) => available.includes(candidate))
  const compatible = available.filter((id) => /llama|qwen|mixtral|gemma|gpt-oss/i.test(id) && !preferred.includes(id))
  return [...preferred, ...compatible]
}

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>(readConversations)
  const [activeId, setActiveId] = useState('')
  const [effort, setEffort] = useState<EffortLevel>('High')
  const [apiKey, setApiKey] = useState('')
  const [online, setOnline] = useState(navigator.onLine)
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [account, setAccount] = useState<{ name: string; email: string } | null>(() => { try { return JSON.parse(localStorage.getItem(ACCOUNT_STORAGE) || 'null') } catch { return null } })
  const [accountOpen, setAccountOpen] = useState(false)
  const [version, setVersion] = useState<AzuremindVersion>('1.1')
  const [modelId, setModelId] = useState(MODEL_BY_VERSION['1.1'])
  const [serverConfigured] = useState(__AZUREMIND_SERVER_CONFIGURED__)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('cobalt-dark-mode') === 'true')
  const [defaultModel, setDefaultModel] = useState<AzuremindVersion>(() => (localStorage.getItem('cobalt-default-model') as AzuremindVersion) || '1.1')
  const [systemPrompt, setSystemPrompt] = useState(() => localStorage.getItem('cobalt-system-prompt') || '')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [product, setProduct] = useState<'chat' | 'code'>('chat')
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  const activeConversation = conversations.find((conversation) => conversation.id === activeId) || { id: '', title: '', updatedAt: '', messages: [] }
  const access = accessForEmail(account?.email || '')
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations)) }, [conversations])
  useEffect(() => { const captureInstall = (event: Event) => { event.preventDefault(); setInstallPrompt(event as BeforeInstallPromptEvent) }; window.addEventListener('beforeinstallprompt', captureInstall); return () => window.removeEventListener('beforeinstallprompt', captureInstall) }, [])
  useEffect(() => { localStorage.setItem('cobalt-dark-mode', String(darkMode)); localStorage.setItem('cobalt-default-model', defaultModel); localStorage.setItem('cobalt-system-prompt', systemPrompt) }, [darkMode, defaultModel, systemPrompt])
  useEffect(() => { if (apiKey) localStorage.setItem(API_KEY_STORAGE, apiKey); else localStorage.removeItem(API_KEY_STORAGE) }, [apiKey])
  useEffect(() => {
    if (!online) return
    const controller = new AbortController()
    console.info('[Cobalt startup]', { online, serverConfigured, product, version, model: modelId })
    discoverModels(apiKey).then((models) => { console.info('[Cobalt model discovery] available compatible models:', models); const preferredModel = product === 'code' ? CODE_MODEL_BY_VERSION[version] : MODEL_BY_VERSION[version]; if (models.includes(preferredModel)) setModelId(preferredModel); else if (models[0]) setModelId(models[0]) }).catch((error) => console.error('[Cobalt model discovery]', error))
    return () => controller.abort()
  }, [apiKey, online, version, product])
  useEffect(() => { const goOnline = () => setOnline(true); const goOffline = () => setOnline(false); window.addEventListener('online', goOnline); window.addEventListener('offline', goOffline); if ('serviceWorker' in navigator) { if (import.meta.env.PROD) navigator.serviceWorker.register('/sw.js').then((registration) => { if (registration.waiting && window.confirm('A new Azuremind Workspace version is available. Reload now?')) registration.waiting.postMessage({ type: 'SKIP_WAITING' }); registration.addEventListener('updatefound', () => { const worker = registration.installing; worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller && window.confirm('A new Azuremind Workspace version is available. Reload now?')) worker.postMessage({ type: 'SKIP_WAITING' }) }) }) }).catch((error) => console.error('[Azuremind service worker]', error)); else navigator.serviceWorker.getRegistrations().then((registrations) => registrations.forEach((registration) => registration.unregister())).catch(() => undefined) } if (!import.meta.env.PROD && 'caches' in window) caches.delete('azuremind-shell-v1').catch(() => undefined); return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline) } }, [])

  const newChat = () => { const id = crypto.randomUUID(); setConversations((current) => [{ id, title: 'New conversation', updatedAt: 'Just now', messages: [] }, ...current]); setActiveId(id) }
  const sendMessage = async (text: string, attachment?: AttachmentPayload) => {
    console.info('[Cobalt send] started', { product, textLength: text.length, online, serverConfigured, version, model: modelId, attachment: attachment?.name, conversationExists: Boolean(activeId) })
    const conversationId = activeId || crypto.randomUUID()
    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: text, createdAt: formatTime() }
    setConversations((current) => activeId ? current.map((conversation) => conversation.id === conversationId ? { ...conversation, title: text.slice(0, 34), updatedAt: 'Just now', messages: [...conversation.messages, userMessage] } : conversation) : [{ id: conversationId, title: text.slice(0, 34), updatedAt: 'Just now', messages: [userMessage] }, ...current])
    if (!activeId) setActiveId(conversationId)
    if (!online || !serverConfigured) {
      const message = !online ? 'Cobalt AI is offline. Your message is saved locally and can be retried when the connection returns.' : 'Cobalt AI is not configured on this server yet. Add GROQ_API_KEY to the project .env file, restart the dev server, and try again.'
      setConversations((current) => current.map((conversation) => conversation.id === conversationId ? { ...conversation, messages: [...conversation.messages, { id: crypto.randomUUID(), role: 'assistant', content: message, createdAt: formatTime() }] } : conversation))
      return
    }
    setLoading(true)
    try {
      const discovered = await discoverModels(apiKey).catch((error) => { console.error('[Azuremind model discovery]', error); return [] })
      const visionModels = [...VISION_MODEL_CANDIDATES, ...discovered.filter((id) => /qwen3\.6|llama-4-(scout|maverick)|vision/i.test(id))]
      const preferredModel = product === 'code' ? CODE_MODEL_BY_VERSION[version] : MODEL_BY_VERSION[version]
      const codeModels = product === 'code' ? discovered.filter((id) => /code|qwen|gpt-oss|llama/i.test(id)) : []
      const modelsToTry = [...new Set(attachment?.dataUrl ? [...visionModels, ...discovered, ...MODEL_CANDIDATES] : [preferredModel, modelId, ...codeModels, ...discovered, ...MODEL_CANDIDATES])]
      console.info('[Azuremind send] models to try:', modelsToTry)
      let completed = false
      let lastError = ''
      for (const candidate of modelsToTry) {
        const headers: HeadersInit = { 'Content-Type': 'application/json' }
        console.info('[Azuremind send] requesting model:', candidate)
        const userContent = attachment?.dataUrl ? [{ type: 'text', text: text || `Please analyze the attached image ${attachment.name}.` }, { type: 'image_url', image_url: { url: attachment.dataUrl } }] : attachment?.contents ? `${text}\n\n[Attached file: ${attachment.name}]\n${attachment.contents}` : text
        const response = await fetch('/api/azuremind', { method: 'POST', headers, body: JSON.stringify({ model: candidate, temperature: 0.3, stream: true, messages: [{ role: 'system', content: `${identityPrompt} You are Cobalt ${product === 'code' ? 'Code' : 'AI'} ${version}. ${product === 'code' ? 'You are a precise senior software engineer. Prioritize correct, runnable code, explain tradeoffs, preserve existing APIs, and use fenced code blocks with language labels.' : ''} ${effortDescriptions[effort]} ${systemPrompt}` }, ...activeConversation.messages.map(({ role, content }) => ({ role, content })), { role: 'user', content: userContent }] }) })
        console.info('[Azuremind send] response received:', { model: candidate, status: response.status, ok: response.ok })
        if (response.ok) {
          const assistantId = crypto.randomUUID()
          let content = ''
          let thinking = ''
          setConversations((current) => current.map((conversation) => conversation.id === conversationId ? { ...conversation, messages: [...conversation.messages, { id: assistantId, role: 'assistant', content: '', createdAt: formatTime() }] } : conversation))
          if (response.body) {
            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let buffer = ''
            while (true) {
              const { value, done } = await reader.read()
              buffer += decoder.decode(value || new Uint8Array(), { stream: !done })
              const events = buffer.split('\n')
              buffer = events.pop() || ''
              for (const line of events) {
                if (!line.startsWith('data:')) continue
                const payload = line.slice(5).trim()
                if (payload === '[DONE]') continue
                try {
                  const delta = JSON.parse(payload).choices?.[0]?.delta as { content?: string; reasoning?: string } | undefined
                  content += delta?.content || ''
                  thinking += delta?.reasoning || ''
                  if (delta?.content || delta?.reasoning) setConversations((current) => current.map((conversation) => conversation.id === conversationId ? { ...conversation, messages: conversation.messages.map((message) => message.id === assistantId ? { ...message, content, thinking: thinking || undefined } : message) } : conversation))
                } catch (error) { console.warn('[Azuremind stream] ignored malformed event', error) }
              }
              if (done) break
            }
          }
          const tagThinking = content.match(/<(?:think|thinking)>([\s\S]*?)<\/(?:think|thinking)>/i)?.[1]?.trim() || ''
          content = content.replace(/<(?:think|thinking)>[\s\S]*?<\/(?:think|thinking)>/gi, '').trim()
          thinking = [thinking, tagThinking].filter(Boolean).join('\n\n')
          const finalAssistant = { content, thinking: thinking || undefined }
          setConversations((current) => current.map((conversation) => conversation.id === conversationId ? { ...conversation, messages: conversation.messages.map((message) => message.id === assistantId ? { ...message, ...finalAssistant } : message) } : conversation))
          console.info('[Cobalt AI send] stream complete:', { model: candidate, contentLength: content.length, thinkingLength: thinking.length })
          completed = true
          setModelId(candidate)
          break
        }
        const details = await response.text(); lastError = `model=${candidate} status=${response.status} ${details}`; console.error('[Azuremind request]', lastError)
        if (response.status !== 404 || !details.includes('model_not_found')) throw new Error(`Azuremind request failed (${response.status})`)
      }
      if (!completed) throw new Error(`No supported Azuremind model was available. ${lastError}`)
    } catch (error) { console.error('[Azuremind chat]', error); setConversations((current) => current.map((conversation) => conversation.id === conversationId ? { ...conversation, messages: [...conversation.messages, { id: crypto.randomUUID(), role: 'assistant', content: 'Azuremind could not complete that request. Verify the workspace connection key and your network, then try again.', createdAt: formatTime() }] } : conversation)) }
    finally { setLoading(false) }
  }
  const clearHistory = () => { setConversations([]); setActiveId('') }
  const deleteChat = (id: string) => { console.info('[Azuremind chats] deleting conversation:', id); setConversations((current) => current.filter((conversation) => conversation.id !== id)); if (id === activeId) setActiveId('') }
  const saveAccount = (next: { name: string; email: string }) => { setAccount(next); localStorage.setItem(ACCOUNT_STORAGE, JSON.stringify(next)); setAccountOpen(false) }
  const signOut = () => { setAccount(null); localStorage.removeItem(ACCOUNT_STORAGE); setAccountOpen(false) }
  const initials = account ? account.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase() : 'JD'
  if (!account) return <OnboardingPanel onSave={saveAccount} />
  return <div className={`app-shell ${darkMode ? 'dark-mode' : ''}`}><OfflineBanner online={online} /><div className="app-layout"><div className={`sidebar-wrap ${sidebarOpen ? 'open' : ''}`}><Sidebar conversations={conversations} activeId={activeId} apiKey={apiKey} onApiKeyChange={setApiKey} onNewChat={newChat} onSelectChat={setActiveId} onDeleteChat={deleteChat} onClearHistory={clearHistory} product={product} onProductChange={setProduct} /></div><main className="workspace"><header className="topbar"><button className="icon-button mobile-menu" onClick={() => setSidebarOpen(!sidebarOpen)} title="Toggle navigation"><Menu size={18} /></button><button className="icon-button desktop-menu" onClick={() => setSidebarOpen(!sidebarOpen)} title="Collapse sidebar"><PanelLeftClose size={17} /></button><div className="topbar-title"><span>COBALT {product === 'code' ? 'CODE' : 'AI'} WORKSPACE</span><strong>{product === 'code' ? 'Cobalt Code' : 'Cobalt AI'}</strong></div><div className="topbar-actions">{installPrompt && <button className="install-button" onClick={async () => { await installPrompt.prompt(); setInstallPrompt(null) }}>Install app</button>}<span className={`access-pill ${access.isDeveloper || access.isBetaTester ? 'selected' : ''}`}>{access.isDeveloper ? 'Developer' : access.isBetaTester ? 'Beta Tester' : 'Member'}</span><button className="icon-button" title="Notifications"><Bell size={17} /></button><button className="icon-button" title="Help"><HelpCircle size={17} /></button><button className="icon-button" title="Workspace settings" onClick={() => setSettingsOpen(true)}><Settings2 size={17} /></button><button className="user-chip" onClick={() => setAccountOpen(true)} title={`Open ${account.name}'s account`}>{initials}</button></div></header><ChatArea messages={activeConversation.messages} loading={loading} effort={effort} version={version} isDeveloper={access.isDeveloper} product={product} connected={online && serverConfigured} onEffortChange={setEffort} onVersionChange={setVersion} onSend={sendMessage} /></main></div>{accountOpen && <AccountPanel account={account} access={access} onSave={saveAccount} onSignOut={signOut} onClose={() => setAccountOpen(false)} />}{settingsOpen && <SettingsPanel darkMode={darkMode} defaultModel={defaultModel} systemPrompt={systemPrompt} onDarkModeChange={setDarkMode} onDefaultModelChange={(value) => { setDefaultModel(value); setVersion(value) }} onSystemPromptChange={setSystemPrompt} onClose={() => setSettingsOpen(false)} />}</div>
}
