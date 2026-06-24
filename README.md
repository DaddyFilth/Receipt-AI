# Receipt AI

AI-powered receipt template editor. Browse, crawl, generate, and edit receipt templates using natural language prompts.

## Features

- **Template Gallery** — 6 built-in receipt templates (retail, restaurant, hotel, gas station, medical, grocery)
- **AI Editing** — Describe changes in plain English; Ollama AI updates the receipt
- **Custom Generation** — Describe any receipt type and AI creates it from scratch
- **Web Crawler** — Discover receipt templates from popular template sites
- **Manual Editor** — Direct field-by-field editing with live preview
- **PDF Export** — Print/save any receipt as PDF

## Tech Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS
- **Backend:** Express.js, TypeScript
- **AI:** Ollama (local LLM)
- **Crawling:** Cheerio + Axios

## Setup

1. Install and start Ollama:
   ```bash
   # Install Ollama from https://ollama.com
   # Pull a model (e.g., llama3.1)
   ollama pull llama3.1
   # Start Ollama server (runs on http://localhost:11434 by default)
   ollama serve
   ```

2. Install dependencies:
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   cd ..
   ```

3. Configure environment variables:
   ```bash
   cp server/.env.example server/.env
   ```
   Edit `server/.env` to configure Ollama host and model (defaults are provided).

4. Start the development servers:
   ```bash
   npm run dev
   ```

> **Note:** `server/.env` is gitignored. Never commit sensitive configuration to version control.

The client runs on `http://localhost:5173` and proxies API requests to the server on port 3001.

## Build for Production

```bash
npm run build
npm start
```

This builds the client and serves it from the Express server on port 3001.