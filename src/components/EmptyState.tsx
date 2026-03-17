"use client";

import { AlertTriangleIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const SAMPLE_MARKDOWN = `# Welcome to Opsly MD

A minimal viewer that supports **tables**, \`inline code\`, code blocks, math, and Mermaid diagrams.

## Features

| Feature | Supported |
|---------|-----------|
| \`Tables\` | GFM tables |
| Code blocks | Syntax highlighting |
| LaTeX | Inline and block math |
| Mermaid | Flowcharts, diagrams |

## Try Code

\`\`\`bash
echo "Hello, Markdown!"
\`\`\`

## Math Example

Inline: \\(a^2 + b^2 = c^2\\)

Block:
$$
\\frac{1}{2} + \\frac{\\pi}{4}
$$

## Mermaid

\`\`\`mermaid
flowchart LR
  A[Start] --> B[Markdown]
  B --> C[Render]
  C --> D[View]
\`\`\`
`;

const FEATURES = [
  "Upload or paste .md files",
  "Workspaces and nested folders",
  "Drag and drop to move documents",
  "Auto table of contents from headings",
  "GFM tables and code blocks with syntax highlighting",
  "Copy code button on code blocks",
  "LaTeX math (inline and block)",
  "Mermaid diagrams (flowcharts, sequences, etc.)",
  "Search across all documents",
  "Edit, rename, and download as .md",
  "Import and export workspaces (JSON)",
  "Dark mode with 7 accent color themes",
  "Local-first, no account, no tracking",
];

export function EmptyState({
  onLoadSample,
}: {
  onLoadSample: (title: string, content: string) => void;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="text-center">
        <h1 className="mb-3 text-3xl font-semibold tracking-[-0.02em] text-foreground">
          Local-first Markdown Workspaces
        </h1>
        <p className="mb-8 text-lg text-black dark:text-zinc-100">
          Paste or upload markdown files, organize them in workspaces and folders,
          and render them with diagrams, math, and syntax highlighting.
        </p>

        <div className="mb-8 flex flex-wrap justify-center gap-4">
          <Button
            type="button"
            size="lg"
            onClick={() => onLoadSample("Welcome", SAMPLE_MARKDOWN)}
            className="bg-orange-600 text-white hover:bg-orange-700 dark:[background-color:var(--dm-btn)] dark:hover:[background-color:var(--dm-btn-hover)]"
          >
            Try sample document
          </Button>
        </div>

        <Card className="mb-8 text-left ring-1 ring-orange-500/50 dark:ring-[color:var(--dm-border)]">
          <CardHeader>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-500">
              What you can do
            </h2>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-2.5">
                  <Check className="size-4 shrink-0 text-red-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="flex items-start gap-3 rounded-md border border-orange-500/50 dark:border-[color:var(--dm-border)] bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-foreground text-left">
          <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden />
          <div>
            <p>
              <span className="font-semibold">All documents are stored locally in this browser.</span>{" "}
              Clearing browser data may remove your documents. Export your workspace regularly to keep a backup.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

