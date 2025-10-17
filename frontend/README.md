# Airia Agent Playground

This frontend is a small Next.js (T3 stack) playground that proxies browser input to an Airia pipeline while keeping your API key on the server. Each browser session receives an anonymous `userId`, so you can experiment with per-user memory or multi-turn flows without exposing real identities.

## Prerequisites

- Node 18+ or Bun 1.1+
- An Airia API key with access to the pipeline `add4efac-37f8-4a82-bad7-cc94c1a8055b`

## Setup

```bash
cp .env.example .env
# edit .env and set AIRIA_API_KEY (pipeline ID already defaults to add4e...)

bun install   # or npm install / pnpm install
bun run dev   # or npm run dev / pnpm dev
```

Visit `http://localhost:3000` and you’ll see a text area with a generated session ID. Submit prompts to send them through `/api/airia`, which proxies the request to the Airia API and returns the JSON response for inspection.

## How it Works

- **Anonymous sessions** – The browser stores a UUID in `sessionStorage` (`airia-anon-user-id`) so each tab gets a stable identifier.
- **API proxy** – `/api/airia` injects `AIRIA_API_KEY` and forwards requests to `https://api.airia.ai/v2/PipelineExecution/{AIRIA_PIPELINE_ID}`. The frontend never touches the secret.
- **Response viewer** – Successful responses are rendered as formatted JSON; failures display the error message surfaced by the proxy.

## Environment Variables

```bash
AIRIA_API_KEY=sk_live_your_key_here
AIRIA_PIPELINE_ID=add4efac-37f8-4a82-bad7-cc94c1a8055b
```

`AIRIA_PIPELINE_ID` is configurable in case you want to point at a different pipeline later.

## Deploying

Any platform that supports Next.js (Vercel, Netlify, Render, etc.) will work. Remember to set the same environment variables in your hosting provider; the proxy route relies on them at runtime.
