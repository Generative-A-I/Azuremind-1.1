import { WifiOff } from 'lucide-react'

export function OfflineBanner({ online }: { online: boolean }) {
  if (online) return null
  return <div className="offline-banner"><WifiOff size={15} /><span>You are offline. AI chat requires a connection; historical chats remain available.</span></div>
}
