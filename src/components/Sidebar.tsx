import { Code2, KeyRound, MessageSquarePlus, Settings2, ShieldCheck, Trash2 } from 'lucide-react'
import type { Conversation } from '../types'

type Props = {
  conversations: Conversation[]
  activeId: string
  apiKey: string
  onApiKeyChange: (value: string) => void
  onNewChat: () => void
  onSelectChat: (id: string) => void
  onDeleteChat: (id: string) => void
  onClearHistory: () => void
  product: 'chat' | 'code'
  onProductChange: (product: 'chat' | 'code') => void
}

export function Sidebar({ conversations, activeId, apiKey, onApiKeyChange, onNewChat, onSelectChat, onDeleteChat, onClearHistory, product, onProductChange }: Props) {
  return <aside className="sidebar">
    <div className="brand"><div className="brand-mark cobalt-mark">C<span /></div><div><strong>Cobalt AI</strong><small>Workspace</small></div></div>
    <button className={`product-switch ${product === 'chat' ? 'active' : ''}`} onClick={() => onProductChange('chat')}><span className="product-icon cobalt-mark small">C<span /></span><span><strong>Cobalt AI</strong><small>Chat workspace</small></span></button><button className={`product-switch ${product === 'code' ? 'active' : ''}`} onClick={() => onProductChange('code')}><span className="product-icon code-mark"><Code2 size={15} /></span><span><strong>Cobalt Code</strong><small>Developer workspace</small></span></button>
    <button className="new-chat" onClick={onNewChat}><MessageSquarePlus size={17} /> New conversation <span>⌘ K</span></button>
    <div className="side-section history-section">
      <div className="section-heading"><span>Recent conversations</span><span className="count">{conversations.length}</span></div>
      <div className="conversation-list">
        {conversations.length === 0 && <p className="empty-history">No conversations yet.</p>}
        {conversations.map((conversation) => <div className={`conversation-row ${conversation.id === activeId ? 'active' : ''}`} key={conversation.id}><button className="conversation-item" onClick={() => onSelectChat(conversation.id)}><MessageSquarePlus size={14} /><span>{conversation.title}</span><small>{conversation.updatedAt}</small></button><button className="delete-chat" title={`Delete ${conversation.title}`} onClick={() => onDeleteChat(conversation.id)}><Trash2 size={13} /></button></div>)}
      </div>
    </div>
    <div className="sidebar-bottom">
      <section className="config-panel">
        <div className="section-heading"><span><KeyRound size={14} /> API configuration</span><span className={`status-dot ${apiKey ? 'ready' : ''}`} /></div>
        <label className="field-label" htmlFor="api-key">Workspace connection</label>
        <div id="api-key" className="configured-key"><ShieldCheck size={13} /> Managed by workspace administrator</div>
        <div className="secure-note"><ShieldCheck size={13} /> Credential stays on the server</div>
      </section>
      <button className="side-action" onClick={() => document.querySelector<HTMLButtonElement>('.user-chip')?.click()}><Settings2 size={16} /> Workspace settings</button>
      <button className="side-action danger" onClick={onClearHistory}><Trash2 size={16} /> Clear chat history</button>
      <div className="workspace-meta"><span>COBALT AI</span><span>v1.0.0</span></div>
    </div>
  </aside>
}
