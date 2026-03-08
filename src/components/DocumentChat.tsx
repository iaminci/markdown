"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import {
  createDocumentChatSession,
  type LanguageModelSession,
} from "@/lib/chrome-ai";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ChatMessage = { role: "user" | "assistant"; content: string };

interface DocumentChatProps {
  documentContent: string;
  documentTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentChat({
  documentContent,
  documentTitle,
  open,
  onOpenChange,
}: DocumentChatProps) {
  const [session, setSession] = useState<LanguageModelSession | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    session?.destroy();
    setSession(null);
    setSessionError(null);
  }, [documentContent]);

  useEffect(() => {
    if (open && !session && !sessionLoading && !sessionError) {
      setSessionLoading(true);
      setSessionError(null);
      createDocumentChatSession(documentContent)
        .then((s) => {
          if (s) {
            setSession(s);
          } else {
            setSessionError(
              "Chrome AI unavailable. Enable chrome://flags/#prompt-api-for-gemini-nano-multimodal-input"
            );
          }
        })
        .catch(() => {
          setSessionError("Failed to create chat session.");
        })
        .finally(() => {
          setSessionLoading(false);
        });
    }
  }, [open, documentContent, session, sessionLoading, sessionError]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    return () => {
      session?.destroy();
    };
  }, [session]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || !session || sending) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setSending(true);

    try {
      const response = await session.prompt(text);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch {
      toast.error("Failed to get response.");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't process that request." },
      ]);
    } finally {
      setSending(false);
    }
  }, [input, session, sending]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col sm:max-w-md"
        showCloseButton={true}
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MessageCircle className="size-5" />
            Ask about document
          </SheetTitle>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 py-4">
          {sessionLoading ? (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="size-8 animate-spin" />
                <p className="text-sm">Loading Chrome AI…</p>
              </div>
            </div>
          ) : sessionError ? (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
              <p className="text-center text-sm">{sessionError}</p>
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden rounded-lg border border-border bg-muted/30 p-3">
                {messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Ask anything about &quot;{documentTitle}&quot;. The AI will answer
                    based on the document content.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {messages.map((m, i) => (
                      <div
                        key={i}
                        className={cn(
                          "rounded-lg px-3 py-2 text-sm",
                          m.role === "user"
                            ? "ml-8 bg-primary text-primary-foreground"
                            : "mr-8 bg-muted"
                        )}
                      >
                        {m.role === "assistant" ? (
                          <MarkdownRenderer content={m.content} />
                        ) : (
                          <p className="whitespace-pre-wrap">{m.content}</p>
                        )}
                      </div>
                    ))}
                    {sending && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        <span className="text-sm">Thinking…</span>
                      </div>
                    )}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question about the document…"
                  className="field-sizing-content min-h-[3rem] max-h-32 flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={2}
                  disabled={sending}
                />
                <Button
                  type="button"
                  size="icon"
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="shrink-0"
                >
                  <Send className="size-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function DocumentChatButton({
  documentContent,
  documentTitle,
  open,
  onOpenChange,
}: DocumentChatProps) {
  return (
    <>
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        className="fixed bottom-6 right-6 z-40 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Open document chat"
      >
        <MessageCircle className="size-6" />
      </button>
      <DocumentChat
        documentContent={documentContent}
        documentTitle={documentTitle}
        open={open}
        onOpenChange={onOpenChange}
      />
    </>
  );
}
