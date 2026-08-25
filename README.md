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

## Security notes

The API key in `.env` is a server-side development credential. If a key has been shared publicly, rotate it immediately. Local account settings and chat history are browser-local demo storage, not a production authentication system.

## Useful commands

```bash
npm run dev       # Start development server
npm run build     # Type-check and create production assets
npm run preview   # Serve the production build locally
```
