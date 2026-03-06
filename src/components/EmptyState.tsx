"use client";

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
        <h1 className="mb-3 text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
          Markdown Viewer
        </h1>
        <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">
          View and organize markdown documents. Upload a file or paste content
          to get started.
        </p>

        <div className="mb-12 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={() =>
              onLoadSample("Welcome", SAMPLE_MARKDOWN)
            }
            className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Try sample document
          </button>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-left dark:border-zinc-700 dark:bg-zinc-900/50">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            What you can do
          </h2>
          <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
            <li className="flex items-center gap-3">
              <CheckIcon />
              <span>Upload .md files from the sidebar</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckIcon />
              <span>Paste markdown directly</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckIcon />
              <span>Tables, code blocks with syntax highlighting</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckIcon />
              <span>LaTeX math and Mermaid diagrams</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckIcon />
              <span>Search, dark mode, print-friendly</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="shrink-0 text-green-600 dark:text-green-500"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
