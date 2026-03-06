"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { CodeBlock } from "./CodeBlock";
import { MermaidDiagram } from "./MermaidDiagram";
import type { Components } from "react-markdown";

import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.min.css";

interface MarkdownRendererProps {
  content: string;
}

function isMermaidCode(lang: string | undefined): boolean {
  return lang?.toLowerCase() === "mermaid";
}

function slugify(children: React.ReactNode): string {
  const text = Array.isArray(children)
    ? children.join("")
    : String(children ?? "");
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function createHeading(Tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") {
  return ({ children }: { children?: React.ReactNode }) => (
    <Tag id={slugify(children)}>{children}</Tag>
  );
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const components: Components = {
    code({ node, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className ?? "");
      const lang = match?.[1];
      const code = String(children).replace(/\n$/, "");
      const isBlock = Boolean(className?.includes("language-"));

      if (isBlock && isMermaidCode(lang)) {
        return <MermaidDiagram chart={code} />;
      }

      if (isBlock) {
        return (
          <CodeBlock className={className} node={node} {...props}>
            {children}
          </CodeBlock>
        );
      }

      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    pre({ children }) {
      return <>{children}</>;
    },
    h1: createHeading("h1"),
    h2: createHeading("h2"),
    h3: createHeading("h3"),
    h4: createHeading("h4"),
    h5: createHeading("h5"),
    h6: createHeading("h6"),
  };

  return (
    <article className="prose prose-zinc dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
