import { ArrowUp, Bot, ChevronDown, Copy, Paperclip, Sparkles, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import type { AttachmentPayload, AzuremindVersion, EffortLevel, Message } from '../types'
import { EffortSelector } from './EffortSelector'
import { ModelSelector } from './ModelSelector'

type Props = { messages: Message[]; loading: boolean; effort: EffortLevel; version: AzuremindVersion; connected: boolean; isDeveloper: boolean; product?: 'chat' | 'code'; onEffortChange: (value: EffortLevel) => void; onVersionChange: (value: AzuremindVersion) => void; onSend: (text: string, attachment?: AttachmentPayload) => void }

export function ChatArea({ messages, loading, effort, version, connected, isDeveloper, product = 'chat', onEffortChange, onVersionChange, onSend }: Props) {
  const [draft, setDraft] = useState('')
  const [attachment, setAttachment] = useState<File | null>(null)
  const [attachmentPreview, setAttachmentPreview] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  const messageScroll = useRef<HTMLDivElement>(null)
  useEffect(() => { const element = messageScroll.current; if (element) element.scrollTo({ top: element.scrollHeight, behavior: loading ? 'auto' : 'smooth' }) }, [messages, loading])
  useEffect(() => { if (!attachment?.type.startsWith('image/')) { setAttachmentPreview(''); return } const url = URL.createObjectURL(attachment); setAttachmentPreview(url); return () => URL.revokeObjectURL(url) }, [attachment])
  const chooseAttachment = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) setAttachment(file)
    event.target.value = ''
  }
  const submit = async () => {
    if ((!draft.trim() && !attachment) || loading) return
    let message = draft.trim()
    let contents = ''
    let isText = false
    if (attachment) {
      isText = attachment.type.startsWith('text/') || /\.(md|mdx|csv|json|js|jsx|ts|tsx|css|html|xml|yaml|yml|py|java|c|cpp|cs|sql|sh)$/i.test(attachment.name)
      contents = isText ? (await attachment.text()).slice(0, 120000) : 'Binary or image content is attached. Use the file name and metadata as context.'
    }
    const payload = attachment ? { name: attachment.name, type: attachment.type, contents: isText ? contents : undefined, dataUrl: attachment.type.startsWith('image/') ? await readAsDataUrl(attachment) : undefined } : undefined
    const visibleMessage = draft.trim() || `Please analyze the attached file ${attachment?.name}.`
    onSend(visibleMessage, payload)
    setDraft('')
    setAttachment(null)
  }
  return <main className={`chat-area ${product === 'code' ? 'code-chat' : ''}`}>
    <div className="chat-header"><div><div className="breadcrumb">Workspace <span>/</span> Conversations</div><h1>New conversation</h1></div><div className="header-status"><span className={`live-dot ${connected ? '' : 'disconnected'}`} /> {connected ? 'Cobalt AI online' : 'Setup required'}</div></div>
    <div className={`message-scroll ${product === 'code' ? 'code-message-scroll' : ''}`} ref={messageScroll}>
      {messages.length === 0 ? <div className="empty-state"><div className="empty-icon"><Sparkles size={23} /></div><p className="eyebrow">COBALT {product === 'code' ? 'CODE' : 'AI'} {version}</p><h2>{product === 'code' ? 'What are we building?' : 'How can we help today?'}</h2><p className="empty-copy">{product === 'code' ? 'Review code, debug an issue, or design a clean implementation with your coding workspace.' : 'Ask a question, review a document, or explore a new idea with your enterprise AI workspace.'}</p><div className="suggestions"><button onClick={() => setDraft(product === 'code' ? 'Review this code for bugs and suggest a fix' : 'Summarize the key risks in a project plan')}><span>01</span>{product === 'code' ? 'Review code for bugs' : 'Summarize project risks'}</button><button onClick={() => setDraft(product === 'code' ? 'Create a TypeScript component for this feature' : 'Draft a concise executive update')}><span>02</span>{product === 'code' ? 'Create a component' : 'Draft an executive update'}</button><button onClick={() => setDraft(product === 'code' ? 'Explain this function and improve its readability' : 'Help me structure a decision memo')}><span>03</span>{product === 'code' ? 'Explain a function' : 'Structure a decision memo'}</button></div></div> : messages.map((message) => { const thinking = [message.thinking, extractThinkingTags(message.content)].filter(Boolean).join('\n\n'); return <article className={`message ${message.role}`} key={message.id}><div className="avatar">{message.role === 'assistant' ? <Bot size={17} /> : <User size={16} />}</div><div className="message-body"><div className="message-meta"><strong>{message.role === 'assistant' ? `Cobalt ${product === 'code' ? 'Code' : 'AI'} ${version}` : 'You'}</strong><span>{message.createdAt}</span></div>{thinking && <ThinkingBlock content={thinking} />}{message.role === 'assistant' ? <div className="markdown"><ReactMarkdown components={{ code: MarkdownCode, pre: ({ children }) => <>{children}</> }}>{normalizeMarkdown(stripThinkingTags(message.content))}</ReactMarkdown></div> : <p className="user-content">{stripThinkingTags(message.content)}</p>}{message.role === 'assistant' && <button className="copy-button" title="Copy response" onClick={() => navigator.clipboard?.writeText(stripThinkingTags(message.content))}><Copy size={13} /> Copy</button>}</div></article>})}
      {loading && <div className="message assistant"><div className="avatar"><Bot size={17} /></div><div className="message-body"><div className="message-meta"><strong>Cobalt {product === 'code' ? 'Code' : 'AI'} {version}</strong><span>Working now</span></div><div className="thinking-loading"><span className="spinner" /> Thinking<span className="loading-dots">...</span></div></div></div>}
    </div>
    <div className="composer-wrap"><div className="composer">{attachment && <div className="attachment-chip">{attachmentPreview && <img src={attachmentPreview} alt="Selected attachment preview" />}<Paperclip size={13} /><span>{attachment.name}</span><button onClick={() => setAttachment(null)} title="Remove attachment">×</button></div>}<textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void submit() } }} placeholder={`Message Cobalt ${product === 'code' ? 'Code' : 'AI'} ${version} at ${effort.toLowerCase()} effort...`} rows={1} /><div className="composer-actions"><input ref={fileInput} className="file-input" type="file" accept=".txt,.md,.mdx,.csv,.json,.js,.jsx,.ts,.tsx,.css,.html,.xml,.yaml,.yml,.py,.java,.c,.cpp,.cs,.sql,.sh,image/*,application/pdf" onChange={chooseAttachment} /><button className="attach-button" title="Attach a file" onClick={() => fileInput.current?.click()}><Paperclip size={17} /></button><ModelSelector value={version} isDeveloper={isDeveloper} onChange={onVersionChange} /><EffortSelector value={effort} onChange={onEffortChange} /><span className="composer-hint">Enter to send · Shift + Enter for new line</span><button className="send-button" title="Send message" disabled={(!draft.trim() && !attachment) || loading} onClick={() => void submit()}><ArrowUp size={17} /></button></div></div><div className="composer-footer"><span>Responses may be inaccurate. Verify important information.</span><span>Model: <strong>Cobalt {product === 'code' ? 'Code' : 'AI'} {version} · streaming</strong></span></div></div>
  </main>
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(reader.error); reader.readAsDataURL(file) })
}

function ThinkingBlock({ content }: { content: string }) {
  const [open, setOpen] = useState(false)
  return <div className="thinking-block"><button onClick={() => setOpen(!open)}><ChevronDown size={15} className={open ? 'rotate' : ''} /><span>Thinking Process</span><small>Auditable reasoning summary</small></button>{open && <div className="thinking-content">{content}</div>}</div>
}

function stripThinkingTags(content: string) { return content.replace(/<(?:think|thinking)>[\s\S]*?<\/(?:think|thinking)>/gi, '').trim() }
function extractThinkingTags(content: string) { return content.match(/<(?:think|thinking)>([\s\S]*?)<\/(?:think|thinking)>/i)?.[1]?.trim() || '' }
function normalizeMarkdown(content: string) {
  return content.replace(/\|\s*(?=\|)/g, '|\n').replace(/\|\s*\|/g, '|\n|').replace(/\s+\|\s+(?=[A-Za-z*])/g, ' |\n').replace(/\|\s*[-:]+\s*\|/g, '|\n|---|')
}

function MarkdownCode({ className, children, inline }: { className?: string; children?: ReactNode; inline?: boolean }) {
  const code = String(children ?? '').replace(/\n$/, '')
  if (inline) return <code className={className}>{children}</code>
  const language = className?.match(/language-(\w+)/)?.[1] || 'code'
  return <div className="code-block"><div className="code-header"><span>{language}</span><button onClick={() => navigator.clipboard?.writeText(code)}><Copy size={12} /> Copy code</button></div><pre><code className={className}>{code}</code></pre></div>
}
