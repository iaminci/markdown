/**
 * Chrome built-in AI APIs integration.
 * Requires Chrome 138+ with Gemini Nano (22GB storage, 16GB RAM or 4GB+ VRAM).
 * Summarizer API is in Chrome 138 stable. Rewriter/Prompt API require origin trial or chrome flags.
 * Browser Native Chat (Prompt API): Chrome 139+, 25,000 char context limit.
 */

const DOC_CHAT_CONTEXT_LIMIT = 25_000;

export type LanguageModelAvailability = "available" | "downloading" | "downloadable" | "unavailable";

export interface LanguageModelSession {
  prompt(text: string): Promise<string>;
  promptStreaming(text: string): AsyncIterable<string>;
  destroy(): void;
}

declare global {
  interface Window {
    LanguageModel?: {
      availability(options?: {
        expectedInputs?: Array<{ type: string; languages?: string[] }>;
        expectedOutputs?: Array<{ type: string; languages?: string[] }>;
      }): Promise<LanguageModelAvailability>;
      create(options?: {
        initialPrompts?: Array<{ role: "system" | "user" | "assistant"; content: string; prefix?: boolean }>;
        expectedInputs?: Array<{ type: string; languages?: string[] }>;
        expectedOutputs?: Array<{ type: string; languages?: string[] }>;
        monitor?: (m: EventTarget) => void;
        signal?: AbortSignal;
      }): Promise<LanguageModelSession>;
    };
    Summarizer?: {
      availability(): Promise<"available" | "downloadable" | "unavailable">;
      create(options?: {
        type?: "tldr" | "teaser" | "key-points" | "headline";
        format?: "plain-text" | "markdown";
        length?: "short" | "medium" | "long";
        sharedContext?: string;
        expectedInputLanguages?: string[];
        expectedContextLanguages?: string[];
        outputLanguage?: string;
        preference?: "capability" | "speed" | "auto";
        monitor?: (m: EventTarget) => void;
      }): Promise<{
        summarize(text: string, options?: { context?: string }): Promise<string>;
        summarizeStreaming(
          text: string,
          options?: { context?: string }
        ): AsyncIterable<string>;
        destroy(): void;
      }>;
    };
    Rewriter?: {
      availability(): Promise<"available" | "downloadable" | "unavailable">;
      create(options?: {
        sharedContext?: string;
        length?: "shorter" | "as-is" | "longer";
        format?: "as-is" | "markdown" | "plain-text";
        tone?: "more-formal" | "as-is" | "more-casual";
        expectedInputLanguages?: string[];
        expectedContextLanguages?: string[];
        outputLanguage?: string;
        monitor?: (m: EventTarget) => void;
      }): Promise<{
        rewrite(
          text: string,
          options?: { context?: string; tone?: string }
        ): Promise<string>;
        rewriteStreaming(
          text: string,
          options?: { context?: string; tone?: string }
        ): AsyncIterable<string>;
        destroy(): void;
      }>;
    };
  }
}

export type SummarizerAvailability = "available" | "downloadable" | "unavailable";
export type RewriterAvailability = "available" | "downloadable" | "unavailable";

export function isSummarizerSupported(): boolean {
  return typeof window !== "undefined" && "Summarizer" in window;
}

export function isRewriterSupported(): boolean {
  return typeof window !== "undefined" && "Rewriter" in window;
}

export async function getSummarizerAvailability(): Promise<SummarizerAvailability> {
  if (!isSummarizerSupported()) return "unavailable";
  try {
    return await window.Summarizer!.availability();
  } catch {
    return "unavailable";
  }
}

export async function getRewriterAvailability(): Promise<RewriterAvailability> {
  if (!isRewriterSupported()) return "unavailable";
  try {
    return await window.Rewriter!.availability();
  } catch {
    return "unavailable";
  }
}

export async function summarizeText(
  text: string,
  options?: { type?: "key-points" | "tldr" | "teaser" | "headline"; length?: "short" | "medium" | "long" }
): Promise<string | null> {
  if (typeof window === "undefined" || !isSummarizerSupported()) return null;
  const availability = await getSummarizerAvailability();
  if (availability === "unavailable") return null;
  try {
    const summarizer = await window.Summarizer!.create({
      type: options?.type ?? "key-points",
      format: "markdown",
      length: options?.length ?? "medium",
      sharedContext: "This is markdown document content.",
    });
    const result = await summarizer.summarize(text, {
      context: "Summarize the key points for a markdown document.",
    });
    summarizer.destroy();
    return result;
  } catch {
    return null;
  }
}

export async function rewriteText(
  text: string,
  options?: { tone?: "more-formal" | "as-is" | "more-casual"; length?: "shorter" | "as-is" | "longer" }
): Promise<string | null> {
  if (typeof window === "undefined" || !isRewriterSupported()) return null;
  const availability = await getRewriterAvailability();
  if (availability === "unavailable") return null;
  try {
    const rewriter = await window.Rewriter!.create({
      format: "markdown",
      tone: options?.tone ?? "as-is",
      length: options?.length ?? "as-is",
      sharedContext: "This is markdown document content.",
    });
    const result = await rewriter.rewrite(text);
    rewriter.destroy();
    return result;
  } catch {
    return null;
  }
}

export function isPromptApiSupported(): boolean {
  return typeof window !== "undefined" && "LanguageModel" in window;
}

export async function getPromptApiAvailability(): Promise<LanguageModelAvailability> {
  if (!isPromptApiSupported()) return "unavailable";
  try {
    return await window.LanguageModel!.availability({
      expectedInputs: [{ type: "text", languages: ["en"] }],
      expectedOutputs: [{ type: "text", languages: ["en"] }],
    });
  } catch {
    return "unavailable";
  }
}

export async function createDocumentChatSession(
  documentContent: string
): Promise<LanguageModelSession | null> {
  if (typeof window === "undefined" || !isPromptApiSupported()) return null;
  const availability = await getPromptApiAvailability();
  if (availability === "unavailable") return null;
  try {
    const truncated =
      documentContent.length > DOC_CHAT_CONTEXT_LIMIT
        ? documentContent.slice(0, DOC_CHAT_CONTEXT_LIMIT) +
          "\n\n[... document truncated ...]"
        : documentContent;
    const session = await window.LanguageModel!.create({
      initialPrompts: [
        {
          role: "system",
          content: `You are a helpful assistant. Answer questions about the following markdown document. Base your answers only on the document content. If the answer is not in the document, say so.\n\n---\n\n${truncated}`,
        },
      ],
      expectedInputs: [{ type: "text", languages: ["en"] }],
      expectedOutputs: [{ type: "text", languages: ["en"] }],
    });
    return session;
  } catch {
    return null;
  }
}
