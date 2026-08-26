# Cobalt AI Workspace

Cobalt AI is a React + TypeScript workspace with streaming chat, Markdown rendering, image/file attachments, local chat history, Cobalt Code mode, settings, dark mode, and PWA support.

## Requirements

- Node.js 18 or newer
- npm
- A valid Groq API key

## Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_rotated_api_key
```

The key is used by the Vite development proxy and is never sent to the browser. Do not commit `.env`.

## Run locally

Start the development server:

```bash
npm run dev
```

Open the URL printed by Vite, usually:

```text
http://localhost:5173/
```

If the browser says the server cannot be found:

1. Run `npm install` from the project root, then run `npm run dev -- --host 0.0.0.0`.
2. Open the exact URL printed by Vite. The normal local URL is `http://localhost:5173/`; a forwarded Codespaces URL may look different.
	In Codespaces, open the **Ports** panel, find port `5173`, and choose **Open in Browser**. Do not reuse an old `*.app.github.dev` link after restarting or recreating the Codespace; old forwarded hostnames can return `HTTP 404` even while the local server is healthy.
	If the port is private, run `gh codespace ports visibility 5173:public -c "$CODESPACE_NAME"`, then reopen the browse URL shown by `gh codespace ports -c "$CODESPACE_NAME"`.
3. Confirm the terminal still shows `VITE ready` and has not returned to a shell prompt. Stop stale processes with `Ctrl+C` before restarting.
4. If the page loads but model discovery reports `401 Invalid API Key`, check `.env` contains a current `GROQ_API_KEY`, remove accidental quotes or spaces, and restart Vite after changing it. Never paste the key into the browser or commit `.env`.
5. If Vite reports a missing native `rolldown` binding, run `npm install` again. If that does not repair it, remove `node_modules` and `package-lock.json`, run `npm install`, and start the server again.

## Production preview

Build the app:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

For PWA installation, use the production preview over HTTPS or localhost. The browser may show an install control when the app meets its installability requirements.

## Features

- **Cobalt AI:** General-purpose chat with streaming responses.
- **Cobalt Code:** Coding-focused chat with code-oriented prompts and model preferences.
- **Models:** Cobalt versions map to different underlying provider models and fall back when a model is unavailable.
- **Attachments:** Attach text/code files or images. Text contents are sent as model context; images use multimodal input.
- **Markdown:** Tables, lists, inline code, fenced code blocks, and copy buttons.
- **Thinking:** Supported `<think>` and `<thinking>` output is hidden from the answer and shown in a collapsed audit panel.
- **History:** Conversations are stored locally in the browser and can be deleted individually or cleared together.
- **Settings:** Configure dark mode, the default Cobalt version, and an additional system prompt.
- **PWA:** Includes a manifest, Cobalt icons, service-worker caching, offline history access, and update handling.
- **Account access:** The workspace requires onboarding and has no guest mode. Developer-owned email lists in `src/App.tsx` control Beta Tester benefits and the private Dev model. Replace the placeholder addresses in `BETA_TESTER_EMAILS` and `DEVELOPER_EMAILS` with real addresses before sharing the app.

## Security notes

The API key in `.env` is a server-side development credential. If a key has been shared publicly, rotate it immediately. Account settings, access lists, passwords, and chat history are browser-local demo storage; this is not production authentication or authorization. The beta and developer allowlists are visible in the client bundle, so use a real backend identity service before treating these entitlements as secure.

## Useful commands

```bash
npm run dev       # Start development server
npm run build     # Type-check and create production assets
npm run preview   # Serve the production build locally
```
