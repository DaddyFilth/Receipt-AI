# Receipt AI

AI-powered receipt template editor. Browse, crawl, generate, and edit receipt templates using natural language prompts.

## Features

- **Template Gallery** — 6 built-in receipt templates (retail, restaurant, hotel, gas station, medical, grocery)
- **AI Editing** — Describe changes in plain English; Gemini AI updates the receipt
- **Custom Generation** — Describe any receipt type and AI creates it from scratch
- **Web Crawler** — Discover receipt templates from popular template sites
- **Manual Editor** — Direct field-by-field editing with live preview
- **PDF Export** — Print/save any receipt as PDF

## Tech Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS
- **Backend:** Express.js, TypeScript
- **AI:** Google Gemini 2.0 Flash
- **Crawling:** Cheerio + Axios

## Setup

```bash
# Install all dependencies
npm install
cd client && npm install
cd ../server && npm install
cd ..

# Set your Gemini API key
export GEMINI_API_KEY=your_key_here

# Run development servers
npm run dev
```

The client runs on `http://localhost:5173` and proxies API requests to the server on port 3001.

## Build for Production

```bash
npm run build
npm start
```

This builds the client and serves it from the Express server on port 3001.
