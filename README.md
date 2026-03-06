# Markdown Viewer

A minimal markdown viewer with paste/upload support, multiple documents, and rich rendering. Deploy to Vercel with one click.

## Features

- **Paste or upload** markdown files in the browser
- **Multiple documents** with sidebar navigation
- **Table of contents** auto-generated from headings
- **Syntax highlighting** for code blocks
- **Math** (LaTeX/KaTeX) support
- **Mermaid diagrams** (flowcharts, sequence diagrams, etc.)
- **Dark/light theme** toggle
- **Copy code** button on code blocks
- **Search** across documents
- **Print-friendly** layout

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Deploy (no build config needed)

Or install the Vercel CLI and run:

```bash
npm i -g vercel
vercel
```

## Tech Stack

- Next.js 16 (App Router)
- Tailwind CSS
- react-markdown with remark-gfm, remark-math, rehype-katex, rehype-highlight
- Mermaid for diagrams
- IndexedDB for document persistence

## Note

Documents are stored in the browser's IndexedDB. They persist only on the device where they were created and are not synced across devices. Existing documents in localStorage are automatically migrated to IndexedDB on first load.
