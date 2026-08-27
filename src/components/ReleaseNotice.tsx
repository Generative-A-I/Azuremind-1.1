import { CheckCircle2, X } from 'lucide-react'

type Props = { onClose: () => void }

export function ReleaseNotice({ onClose }: Props) {
  return <div className="release-notice-backdrop"><section className="release-notice" role="dialog" aria-modal="true" aria-labelledby="release-notice-title"><button className="modal-close" onClick={onClose} title="Close"><X size={17} /></button><div className="release-notice-icon"><CheckCircle2 size={24} /></div><p className="eyebrow">WORKSPACE UPDATE</p><h2 id="release-notice-title">Image generation is working</h2><p>We updated Cobalt AI and reloaded this page so the latest image-generation fixes are active. You can now create images from the image studio in the composer.</p><button className="modal-submit" onClick={onClose}>Continue to Cobalt AI <span>→</span></button></section></div>
}
