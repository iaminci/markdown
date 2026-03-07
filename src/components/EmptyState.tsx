"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const SAMPLE_MARKDOWN = `# Welcome to Markdown Viewer

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

export function EmptyState({
  onLoadSample,
}: {
  onLoadSample: (title: string, content: string) => void;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="text-center">
        <h1 className="mb-3 text-3xl font-semibold text-foreground">
          Markdown Viewer
        </h1>
        <p className="mb-8 text-lg text-muted-foreground">
          View and organize markdown documents. Upload a file or paste content
          to get started.
        </p>

        <div className="mb-12 flex flex-wrap justify-center gap-4">
          <Button
            type="button"
            size="lg"
            onClick={() => onLoadSample("Welcome", SAMPLE_MARKDOWN)}
          >
            Try sample document
          </Button>
        </div>

        <Card className="text-left">
          <CardHeader>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              What you can do
            </h2>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-3">
                <Check className="size-5 shrink-0 text-green-600 dark:text-green-500" />
                <span>Upload .md files from the sidebar</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="size-5 shrink-0 text-green-600 dark:text-green-500" />
                <span>Paste markdown directly</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="size-5 shrink-0 text-green-600 dark:text-green-500" />
                <span>Tables, code blocks with syntax highlighting</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="size-5 shrink-0 text-green-600 dark:text-green-500" />
                <span>LaTeX math and Mermaid diagrams</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="size-5 shrink-0 text-green-600 dark:text-green-500" />
                <span>Search, dark mode, save to file</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

