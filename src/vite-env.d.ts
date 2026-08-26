/// <reference types="vite/client" />

export {}
declare global {
	const __AZUREMIND_SERVER_CONFIGURED__: boolean
	interface Window { puter?: { ai?: { txt2img: (prompt: string, options?: { model?: string }) => Promise<Blob | HTMLImageElement | string | { src?: string; url?: string }> } } }
	interface BeforeInstallPromptEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }
}
