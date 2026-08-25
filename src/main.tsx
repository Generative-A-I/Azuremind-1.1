import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App, { AppErrorBoundary } from './App'
import './styles.css'

const root = document.getElementById('root')
const showBootError = (error: unknown) => {
	const message = error instanceof Error ? error.message : String(error)
	console.error('[Azuremind boot]', error)
	if (root) root.innerHTML = `<div class="runtime-error"><div class="runtime-error-mark cobalt-mark">C<span></span></div><p class="eyebrow">COBALT AI WORKSPACE</p><h1>Workspace could not load</h1><p>${message.replace(/[&<>]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[character] || character))}</p><button onclick="location.reload()">Refresh workspace</button></div>`
}
window.addEventListener('error', (event) => showBootError(event.error || event.message))
window.addEventListener('unhandledrejection', (event) => console.error('[Azuremind unhandled rejection]', event.reason))

try {
	if (!root) throw new Error('The application root element is missing.')
	createRoot(root).render(<StrictMode><AppErrorBoundary><App /></AppErrorBoundary></StrictMode>)
} catch (error) {
	showBootError(error)
}
