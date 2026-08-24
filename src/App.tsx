import { Component, useEffect, useState } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { Bell, HelpCircle, Menu, PanelLeftClose } from 'lucide-react'
import { AccountPanel } from './components/AccountPanel'
import { ChatArea } from './components/ChatArea'
import { EffortSelector } from './components/EffortSelector'
import { OfflineBanner } from './components/OfflineBanner'
import { Sidebar } from './components/Sidebar'
import type { Conversation, EffortLevel, Message } from './types'

const STORAGE_KEY = 'azuremind-conversations'
const API_KEY_STORAGE = 'azuremind-groq-key'
const ACCOUNT_STORAGE = 'azuremind-account'
const MODEL_CANDIDATES = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'llama-4-scout-17b-16e-instruct', 'qwen/qwen3-32b']
const prompts: Record<EffortLevel, string> = { Extra: 'You are Azuremind 1.1. Give an especially thorough, structured answer. Provide a concise reasoning summary, not private chain-of-thought.', High: 'You are Azuremind 1.1 running at High Effort capacity. Provide a detailed, deep-thinking breakdown as a brief auditable summary before a clear, structured response.', Normal: 'You are Azuremind 1.1 running at Normal Effort capacity. Provide a brief reasoning summary, then give a standard, direct answer.', Low: 'You are Azuremind 1.1 running at Low Effort capacity. Do not overthink. Provide a direct, immediate, concise answer.' }

function formatTime(date = new Date()) { return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
function readConversations(): Conversation[] { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] } }

export class AppErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('[Azuremind startup]', error, info.componentStack) }
  render() {
    if (!this.state.error) return this.props.children
    return <div className="runtime-error"><div className="runtime-error-mark">A</div><p className="eyebrow">AZUREMIND WORKSPACE</p><h1>Workspace could not load</h1><p>Refresh the page to try again. If the problem continues, open the browser console for the startup error.</p><button onClick={() => window.location.reload()}>Refresh workspace</button></div>
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
  const [modelId, setModelId] = useState(MODEL_CANDIDATES[0])
  const [serverConfigured] = useState(__AZUREMIND_SERVER_CONFIGURED__)

  const activeConversation = conversations.find((conversation) => conversation.id === activeId) || { id: '', title: '', updatedAt: '', messages: [] }
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations)) }, [conversations])
  useEffect(() => { if (apiKey) localStorage.setItem(API_KEY_STORAGE, apiKey); else localStorage.removeItem(API_KEY_STORAGE) }, [apiKey])
  useEffect(() => {
    if (!online) return
    const controller = new AbortController()
    console.info('[Azuremind startup]', { online, serverConfigured, model: modelId })
    discoverModels(apiKey).then((models) => { console.info('[Azuremind model discovery] available compatible models:', models); if (models[0]) setModelId(models[0]) }).catch((error) => console.error('[Azuremind model discovery]', error))
    return () => controller.abort()
  }, [apiKey, online])
  useEffect(() => { const goOnline = () => setOnline(true); const goOffline = () => setOnline(false); window.addEventListener('online', goOnline); window.addEventListener('offline', goOffline); if ('serviceWorker' in navigator) { if (import.meta.env.PROD) navigator.serviceWorker.register('/sw.js').then((registration) => { if (registration.waiting && window.confirm('A new Azuremind Workspace version is available. Reload now?')) registration.waiting.postMessage({ type: 'SKIP_WAITING' }); registration.addEventListener('updatefound', () => { const worker = registration.installing; worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller && window.confirm('A new Azuremind Workspace version is available. Reload now?')) worker.postMessage({ type: 'SKIP_WAITING' }) }) }) }).catch((error) => console.error('[Azuremind service worker]', error)); else navigator.serviceWorker.getRegistrations().then((registrations) => registrations.forEach((registration) => registration.unregister())).catch(() => undefined) } if (!import.meta.env.PROD && 'caches' in window) caches.delete('azuremind-shell-v1').catch(() => undefined); return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline) } }, [])

  const newChat = () => { const id = crypto.randomUUID(); setConversations((current) => [{ id, title: 'New conversation', updatedAt: 'Just now', messages: [] }, ...current]); setActiveId(id) }
  const sendMessage = async (text: string) => {
    console.info('[Azuremind send] started', { textLength: text.length, online, serverConfigured, model: modelId, conversationExists: Boolean(activeId) })
    const conversationId = activeId || crypto.randomUUID()
    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: text, createdAt: formatTime() }
    setConversations((current) => activeId ? current.map((conversation) => conversation.id === conversationId ? { ...conversation, title: text.slice(0, 34), updatedAt: 'Just now', messages: [...conversation.messages, userMessage] } : conversation) : [{ id: conversationId, title: text.slice(0, 34), updatedAt: 'Just now', messages: [userMessage] }, ...current])
    if (!activeId) setActiveId(conversationId)
    if (!online || !serverConfigured) {
      const message = !online ? 'Azuremind is offline. Your message is saved locally and can be retried when the connection returns.' : 'Azuremind is not configured on this server yet. Add GROQ_API_KEY to the project .env file, restart the dev server, and try again.'
      setConversations((current) => current.map((conversation) => conversation.id === conversationId ? { ...conversation, messages: [...conversation.messages, { id: crypto.randomUUID(), role: 'assistant', content: message, createdAt: formatTime() }] } : conversation))
      return
    }
    setLoading(true)
    try {
      const discovered = await discoverModels(apiKey).catch((error) => { console.error('[Azuremind model discovery]', error); return [] })
      const modelsToTry = [...new Set([modelId, ...discovered, ...MODEL_CANDIDATES])]
      console.info('[Azuremind send] models to try:', modelsToTry)
      let data: { choices?: { message?: { content?: string } }[] } | undefined
      let lastError = ''
      for (const candidate of modelsToTry) {
        const headers: HeadersInit = { 'Content-Type': 'application/json' }
        console.info('[Azuremind send] requesting model:', candidate)
        const response = await fetch('/api/azuremind', { method: 'POST', headers, body: JSON.stringify({ model: candidate, temperature: 0.4, messages: [{ role: 'system', content: prompts[effort] }, ...activeConversation.messages.map(({ role, content }) => ({ role, content })), { role: 'user', content: text }] }) })
        console.info('[Azuremind send] response received:', { model: candidate, status: response.status, ok: response.ok })
        if (response.ok) { data = await response.json(); console.info('[Azuremind send] payload received:', { hasChoices: Boolean(data?.choices?.length), hasContent: Boolean(data?.choices?.[0]?.message?.content), hasReasoning: Boolean((data?.choices?.[0]?.message as { reasoning?: string } | undefined)?.reasoning) }); setModelId(candidate); break }
        const details = await response.text(); lastError = `model=${candidate} status=${response.status} ${details}`; console.error('[Azuremind request]', lastError)
        if (response.status !== 404 || !details.includes('model_not_found')) throw new Error(`Azuremind request failed (${response.status})`)
      }
      if (!data) throw new Error(`No supported Azuremind model was available. ${lastError}`)
      const providerMessage = data.choices?.[0]?.message
      const raw = providerMessage?.content || 'No response was returned.'; const thinking = raw.match(/<thinking>([\s\S]*?)<\/thinking>/i)?.[1]?.trim() || (providerMessage as { reasoning?: string } | undefined)?.reasoning; const content = raw.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '').trim(); const assistant: Message = { id: crypto.randomUUID(), role: 'assistant', content, thinking, createdAt: formatTime() }
      console.info('[Azuremind send] rendering assistant message:', { conversationId, contentLength: content.length, hasThinking: Boolean(thinking) })
      setConversations((current) => current.map((conversation) => conversation.id === conversationId ? { ...conversation, messages: [...conversation.messages, assistant], updatedAt: 'Just now' } : conversation))
    } catch (error) { console.error('[Azuremind chat]', error); setConversations((current) => current.map((conversation) => conversation.id === conversationId ? { ...conversation, messages: [...conversation.messages, { id: crypto.randomUUID(), role: 'assistant', content: 'Azuremind could not complete that request. Verify the workspace connection key and your network, then try again.', createdAt: formatTime() }] } : conversation)) }
    finally { setLoading(false) }
  }
  const clearHistory = () => { setConversations([]); setActiveId('') }
  const deleteChat = (id: string) => { console.info('[Azuremind chats] deleting conversation:', id); setConversations((current) => current.filter((conversation) => conversation.id !== id)); if (id === activeId) setActiveId('') }
  const saveAccount = (next: { name: string; email: string }) => { setAccount(next); localStorage.setItem(ACCOUNT_STORAGE, JSON.stringify(next)); setAccountOpen(false) }
  const signOut = () => { setAccount(null); localStorage.removeItem(ACCOUNT_STORAGE); setAccountOpen(false) }
  const initials = account ? account.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase() : 'JD'
  return <div className="app-shell"><OfflineBanner online={online} /><div className="app-layout"><div className={`sidebar-wrap ${sidebarOpen ? 'open' : ''}`}><Sidebar conversations={conversations} activeId={activeId} apiKey={apiKey} onApiKeyChange={setApiKey} onNewChat={newChat} onSelectChat={setActiveId} onDeleteChat={deleteChat} onClearHistory={clearHistory} /></div><main className="workspace"><header className="topbar"><button className="icon-button mobile-menu" onClick={() => setSidebarOpen(!sidebarOpen)} title="Toggle navigation"><Menu size={18} /></button><button className="icon-button desktop-menu" onClick={() => setSidebarOpen(!sidebarOpen)} title="Collapse sidebar"><PanelLeftClose size={17} /></button><div className="topbar-title"><span>AI WORKSPACE</span><strong>Azuremind Workspace</strong></div><div className="topbar-actions"><EffortSelector value={effort} onChange={setEffort} /><button className="icon-button" title="Notifications"><Bell size={17} /></button><button className="icon-button" title="Help"><HelpCircle size={17} /></button><button className="user-chip" onClick={() => setAccountOpen(true)} title={account ? `Open ${account.name}'s account` : 'Create or sign in'}>{initials}</button></div></header><ChatArea messages={activeConversation.messages} loading={loading} effort={effort} connected={online && serverConfigured} onSend={sendMessage} /></main></div>{accountOpen && <AccountPanel account={account} onSave={saveAccount} onSignOut={signOut} onClose={() => setAccountOpen(false)} />}</div>
}
