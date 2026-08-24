import { LogIn, UserPlus, X } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'

type Account = { name: string; email: string }
type Props = { account: Account | null; onSave: (account: Account) => void; onSignOut: () => void; onClose: () => void }

export function AccountPanel({ account, onSave, onSignOut, onClose }: Props) {
  const [mode, setMode] = useState<'signin' | 'create'>(account ? 'signin' : 'create')
  const [name, setName] = useState(account?.name || '')
  const [email, setEmail] = useState(account?.email || '')
  const [password, setPassword] = useState('')
  const submit = (event: FormEvent) => { event.preventDefault(); if (email.trim() && password.trim() && (mode === 'signin' || name.trim())) onSave({ name: name.trim() || email.split('@')[0], email: email.trim() }) }
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="account-modal" role="dialog" aria-modal="true" aria-labelledby="account-title"><button className="modal-close" onClick={onClose} title="Close"><X size={17} /></button><div className="modal-kicker">AZUREMIND IDENTITY</div><h2 id="account-title">{account ? 'Account settings' : mode === 'create' ? 'Create your workspace account' : 'Sign in to Azuremind'}</h2><p className="modal-copy">Your account keeps workspace preferences and access settings together on this device.</p>{!account && <div className="auth-tabs"><button className={mode === 'create' ? 'selected' : ''} onClick={() => setMode('create')}><UserPlus size={14} /> Create account</button><button className={mode === 'signin' ? 'selected' : ''} onClick={() => setMode('signin')}><LogIn size={14} /> Sign in</button></div>}<form onSubmit={submit}>{(mode === 'create' || account) && <label className="modal-field">Full name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Jordan Davis" autoComplete="name" /></label>}<label className="modal-field">Work email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" autoComplete="email" /></label><label className="modal-field">Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="********" autoComplete={account ? 'current-password' : 'new-password'} /></label><button className="modal-submit" type="submit">{account ? 'Save account' : mode === 'create' ? 'Create account' : 'Sign in'} <span>→</span></button></form>{account && <button className="sign-out" onClick={onSignOut}>Sign out of this workspace</button>}</section></div>
}
