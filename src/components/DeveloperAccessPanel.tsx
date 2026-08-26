import { Plus, ShieldCheck, Trash2, X } from 'lucide-react'
import { useState } from 'react'

type Props = { betaEmails: string[]; developerEmails: string[]; onAdd: (kind: 'beta' | 'developer', email: string) => void; onRemove: (kind: 'beta' | 'developer', email: string) => void; onClose: () => void }

export function DeveloperAccessPanel({ betaEmails, developerEmails, onAdd, onRemove, onClose }: Props) {
  const [email, setEmail] = useState('')
  const [kind, setKind] = useState<'beta' | 'developer'>('beta')
  const add = () => { onAdd(kind, email); setEmail('') }
  const list = (label: string, values: string[], type: 'beta' | 'developer') => <div className="access-list"><strong>{label}</strong>{values.map((entry) => <div className="access-row" key={entry}><span>{entry}</span><button title={`Remove ${entry}`} onClick={() => onRemove(type, entry)}><Trash2 size={14} /></button></div>)}</div>
  return <div className="modal-backdrop"><section className="settings-modal developer-modal" role="dialog" aria-modal="true" aria-labelledby="developer-access-title"><button className="modal-close" onClick={onClose} title="Close"><X size={17} /></button><div className="modal-kicker">DEVELOPER CONTROLS</div><h2 id="developer-access-title">Access lists</h2><p className="modal-copy">Add or remove beta testers and developers from this browser. These lists are local demo settings, not secure authorization.</p><div className="developer-add"><select value={kind} onChange={(event) => setKind(event.target.value as 'beta' | 'developer')}><option value="beta">Beta Tester</option><option value="developer">Developer</option></select><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') add() }} placeholder="person@example.com" /><button onClick={add} disabled={!email.trim()} title="Add email"><Plus size={16} /></button></div>{list('Beta testers', betaEmails, 'beta')}{list('Developers', developerEmails, 'developer')}<div className="onboarding-note"><ShieldCheck size={14} /><span>Only the configured developer account should use this panel.</span></div></section></div>
}
