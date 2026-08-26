import { ArrowRight, BadgeCheck, Code2, Image, MessageSquare, Paperclip, Palette, Sparkles } from 'lucide-react'
import { useState } from 'react'

type Access = { isBetaTester: boolean; isDeveloper: boolean }
type Props = { access: Access; onComplete: () => void }

const features = [
  { icon: MessageSquare, title: 'Chat and code', copy: 'Ask questions, review documents, debug code, and switch between Cobalt AI and Cobalt Code.' },
  { icon: Image, title: 'Create images', copy: 'Open the image studio, describe what you want, and generate an image from your prompt.' },
  { icon: Paperclip, title: 'Attach files', copy: 'Add text files or images to give your conversations useful context.' },
  { icon: Palette, title: 'Make it yours', copy: 'Switch between the Classic and Modern workspace styles, use dark mode, and tune your model settings.' },
]

export function WalkthroughPanel({ access, onComplete }: Props) {
  const [step, setStep] = useState(0)
  const isLast = step === features.length
  const current = features[step]
  const Icon = current?.icon || BadgeCheck
  return <div className="walkthrough-shell"><section className="walkthrough-panel" role="dialog" aria-modal="true" aria-labelledby="walkthrough-title"><div className="walkthrough-progress"><span>WELCOME TOUR</span><span>{step + 1} / {features.length + 1}</span></div><div className="walkthrough-icon"><Icon size={24} /></div>{isLast ? <><p className="eyebrow">YOUR ACCESS</p><h1 id="walkthrough-title">{access.isDeveloper ? 'You have developer access.' : access.isBetaTester ? 'You were chosen.' : 'Your workspace is ready.'}</h1><p className="walkthrough-copy">{access.isDeveloper ? 'You have the private developer build, Dev model controls, expanded usage, and beta benefits.' : access.isBetaTester ? 'You were chosen for the Cobalt AI beta. You have expanded usage, early feature access, and a direct line to help shape what ships next.' : 'You have the core Cobalt AI workspace. You can explore chat, code, image generation, attachments, and personalization.'}</p><div className="walkthrough-benefits"><BadgeCheck size={16} /><span>{access.isDeveloper ? 'Developer + Beta Tester benefits' : access.isBetaTester ? 'Beta Tester benefits unlocked' : 'Standard member access'}</span></div></> : <><p className="eyebrow">FEATURE {step + 1}</p><h1 id="walkthrough-title">{current.title}</h1><p className="walkthrough-copy">{current.copy}</p></>}<button className="modal-submit" onClick={() => isLast ? onComplete() : setStep(step + 1)}>{isLast ? 'Enter workspace' : 'Continue'} <ArrowRight size={16} /></button><div className="walkthrough-required"><Sparkles size={13} /> This quick tour is required before you begin.</div></section></div>
}
