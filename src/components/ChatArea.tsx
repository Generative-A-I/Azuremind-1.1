import { ArrowUp, Bot, ChevronDown, Copy, Paperclip, Sparkles, User } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import type { EffortLevel, Message } from '../types'

type Props = { messages: Message[]; loading: boolean; effort: EffortLevel; connected: boolean; onSend: (text: string) => void }

export function ChatArea({ messages, loading, effort, connected, onSend }: Props) {
  const [draft, setDraft] = useState('')
  const submit = () => { if (draft.trim() && !loading) { onSend(draft.trim()); setDraft('') } }
  return <main className="chat-area">
    <div className="chat-header"><div><div className="breadcrumb">Workspace <span>/</span> Conversations</div><h1>New conversation</h1></div><div className="header-status"><span className={`live-dot ${connected ? '' : 'disconnected'}`} /> {connected ? 'Azuremind online' : 'Setup required'}</div></div>
    <div className="message-scroll">
      {messages.length === 0 ? <div className="empty-state"><div className="empty-icon"><Sparkles size={23} /></div><p className="eyebrow">AZUREMIND 1.1</p><h2>How can we help today?</h2><p className="empty-copy">Ask a question, review a document, or explore a new idea with your enterprise AI workspace.</p><div className="suggestions"><button onClick={() => setDraft('Summarize the key risks in a project plan')}><span>01</span>Summarize project risks</button><button onClick={() => setDraft('Draft a concise executive update')}><span>02</span>Draft an executive update</button><button onClick={() => setDraft('Help me structure a decision memo')}><span>03</span>Structure a decision memo</button></div></div> : messages.map((message) => <article className={`message ${message.role}`} key={message.id}><div className="avatar">{message.role === 'assistant' ? <Bot size={17} /> : <User size={16} />}</div><div className="message-body"><div className="message-meta"><strong>{message.role === 'assistant' ? 'Azuremind 1.1' : 'You'}</strong><span>{message.createdAt}</span></div>{message.thinking && <ThinkingBlock content={message.thinking} />}{message.role === 'assistant' ? <div className="markdown"><ReactMarkdown>{message.content}</ReactMarkdown></div> : <p className="user-content">{message.content}</p>}{message.role === 'assistant' && <button className="copy-button" title="Copy response" onClick={() => navigator.clipboard?.writeText(message.content)}><Copy size={13} /> Copy</button>}</div></article>)}
      {loading && <div className="message assistant"><div className="avatar"><Bot size={17} /></div><div className="message-body"><div className="message-meta"><strong>Azuremind 1.1</strong><span>Working now</span></div><div className="thinking-loading"><span className="spinner" /> Thinking<span className="loading-dots">...</span></div></div></div>}
    </div>
    <div className="composer-wrap"><div className="composer"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit() } }} placeholder={`Message Azuremind 1.1 at ${effort.toLowerCase()} effort...`} rows={1} /><div className="composer-actions"><button className="attach-button" title="Attach a file"><Paperclip size={17} /></button><span className="composer-hint">Enter to send · Shift + Enter for new line</span><button className="send-button" title="Send message" disabled={!draft.trim() || loading} onClick={submit}><ArrowUp size={17} /></button></div></div><div className="composer-footer"><span>Responses may be inaccurate. Verify important information.</span><span>Model: <strong>Azuremind 1.1</strong></span></div></div>
  </main>
}

function ThinkingBlock({ content }: { content: string }) {
  const [open, setOpen] = useState(false)
  return <div className="thinking-block"><button onClick={() => setOpen(!open)}><ChevronDown size={15} className={open ? 'rotate' : ''} /><span>Thinking Process</span><small>Auditable reasoning summary</small></button>{open && <div className="thinking-content">{content}</div>}</div>
}
