import { ArrowLeft, BarChart3, X } from 'lucide-react'

type Props = { onClose: () => void }
type Usage = Record<string, number>
const limits: Record<string, number> = { 'openai/gpt-oss-120b': 100, 'openai/gpt-oss-20b': 100, 'qwen/qwen3.6-27b': 75, 'openai/gpt-oss-safeguard-20b': 100 }
const cobaltNames: Record<string, string> = { 'openai/gpt-oss-120b': 'Cobalt 1.1', 'openai/gpt-oss-20b': 'Cobalt 2.0', 'qwen/qwen3.6-27b': 'Cobalt 1.2', 'openai/gpt-oss-safeguard-20b': 'Cobalt 1.0' }

export function UsagePanel({ onClose }: Props) {
  let usage: Usage = {}
  try { usage = JSON.parse(localStorage.getItem('cobalt-model-usage') || '{}') } catch { usage = {} }
  const models = [...new Set([...Object.keys(limits), ...Object.keys(usage)])]
  return <div className="modal-backdrop"><section className="settings-modal usage-modal" role="dialog" aria-modal="true" aria-labelledby="usage-title"><button className="modal-close" onClick={onClose} title="Close"><X size={17} /></button><div className="modal-kicker">WORKSPACE USAGE</div><h2 id="usage-title">Message usage</h2><p className="modal-copy">Usage counts are tracked on this device. Each successful response counts against the Cobalt model that completed it.</p><div className="usage-list">{models.map((model) => { const used = usage[model] || 0; const limit = limits[model] || 100; const percentage = Math.min(100, Math.round((used / limit) * 100)); return <div className="usage-row" key={model}><div className="usage-label"><strong>{cobaltNames[model] || 'Cobalt model'}</strong><span>{used} / {limit} messages</span></div><div className="usage-track"><span style={{ width: `${percentage}%` }} /></div></div> })}</div><button className="usage-back" onClick={onClose}><ArrowLeft size={14} /> Back to profile</button><div className="onboarding-note"><BarChart3 size={14} /><span>Limits are informational until connected to a server-side account system.</span></div></section></div>
}
