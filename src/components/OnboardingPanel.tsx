import { ArrowRight, CheckCircle2, LockKeyhole, Server, Sparkles } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'

type Account = { name: string; email: string }
type Props = { onSave: (account: Account) => void }

export function OnboardingPanel({ onSave }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [serverReady, setServerReady] = useState(false)
  const [checkingServer, setCheckingServer] = useState(false)
  const [serverMessage, setServerMessage] = useState('')
  const setupServer = async () => {
    setCheckingServer(true)
    setServerMessage('Checking the local server...')
    try {
      const response = await fetch('/api/azuremind-models', { cache: 'no-store' })
      setServerReady(true)
      setServerMessage(response.status === 401 ? 'Server found. Add GROQ_API_KEY to .env to enable AI responses.' : 'Server found and ready.')
    } catch {
      setServerReady(false)
      setServerMessage('Server not found. In the project folder, run: npm install && npm run dev -- --host 0.0.0.0')
    } finally {
      setCheckingServer(false)
    }
  }
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (name.trim() && email.trim() && password.trim()) onSave({ name: name.trim(), email: email.trim().toLowerCase() })
  }
  return <div className="onboarding-shell"><div className="onboarding-panel"><div className="onboarding-brand"><div className="brand-mark cobalt-mark">C<span /></div><span>COBALT AI</span></div><div className="onboarding-icon"><Sparkles size={20} /></div><p className="eyebrow">ONE-CLICK SERVER SETUP</p><h1>Get your workspace ready</h1><p className="onboarding-copy">Start with one check. Cobalt will confirm the local server is reachable before asking you to create your account.</p>{!serverReady && <button className="setup-server-button" onClick={() => void setupServer()} disabled={checkingServer}><Server size={17} />{checkingServer ? 'Checking server...' : 'Set up server'}</button>}{serverMessage && <div className={`server-message ${serverReady ? 'ready' : 'error'}`}>{serverReady ? <CheckCircle2 size={15} /> : <Server size={15} />}<span>{serverMessage}</span></div>}{serverReady && <form onSubmit={submit}><label className="modal-field">Full name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Jordan Davis" autoComplete="name" required /></label><label className="modal-field">Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" autoComplete="email" required /></label><label className="modal-field">Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Create a local workspace password" autoComplete="new-password" required /></label><button className="modal-submit" type="submit">Create workspace account <ArrowRight size={16} /></button></form>}<div className="onboarding-note"><LockKeyhole size={14} /><span>No guest mode. Account access keeps this workspace personal.</span></div></div></div>
}
