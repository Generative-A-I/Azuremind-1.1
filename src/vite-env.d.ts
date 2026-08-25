/// <reference types="vite/client" />

declare const __AZUREMIND_SERVER_CONFIGURED__: boolean
interface BeforeInstallPromptEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }
