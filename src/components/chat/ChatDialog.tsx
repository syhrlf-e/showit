import { useState, useRef, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Send, Database, MessageSquare } from "lucide-react";
import { clsx } from "clsx";
import { useERDStore } from "@/store/erdStore";
import { LoadingDots } from "@/components/ui/LoadingDots";

export function ChatDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"natural" | "sql">("natural");
  const messages = useERDStore((state) => state.messages);
  const addMessage = useERDStore((state) => state.addMessage);
  const importSQL = useERDStore((state) => state.importSQL);
  const isGenerating = useERDStore((state) => state.isGenerating);
  const setIsGenerating = useERDStore((state) => state.setIsGenerating);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    addMessage({
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      timestamp: Date.now(),
    });

    setIsGenerating(true);
    const currentInput = input;
    setInput("");

    try {
      if (mode === "sql") {
        // Direct SQL Execution
        importSQL(currentInput);
        addMessage({
          id: crypto.randomUUID(),
          role: "system",
          content: "Executed SQL command successfully.",
          timestamp: Date.now(),
        });
      } else {
        // AI Generation
        // AI Generation
        const response = await fetch("/api/ai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: currentInput }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to generate");

        importSQL(data.sql);
        addMessage({
          id: crypto.randomUUID(),
          role: "system",
          content: "Generated schema based on your request.",
          timestamp: Date.now(),
        });
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      addMessage({
        id: crypto.randomUUID(),
        role: "system",
        content: `Error: ${errorMessage}`,
        timestamp: Date.now(),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <button className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-card/80 backdrop-blur-md border border-primary/20 text-text-secondary hover:text-text-primary hover:border-primary/50 py-3 px-6 rounded-full shadow-2xl transition-all hover:scale-105 flex items-center gap-3 w-[400px] group">
          <div className="p-1.5 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
            <MessageSquare className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm opacity-50 font-medium">
            Ask AI to generate tables...
          </span>
          <div className="ml-auto text-xs opacity-30 border border-border px-1.5 py-0.5 rounded">
            Ctrl+K
          </div>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl bg-card border border-border/50 rounded-xl shadow-2xl p-0 flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200 ring-1 ring-white/10">
          <div className="sr-only">
            <Dialog.Title>Database Chat Assistant</Dialog.Title>
            <Dialog.Description>
              Chat with AI to generate and modify database schemas
            </Dialog.Description>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/50 backdrop-blur-md rounded-t-xl">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-text-primary">
                  Database Assistant
                </h2>
                <p className="text-xs text-text-secondary">
                  Ask to create tables, modify schema, or query data
                </p>
              </div>
            </div>
            <Dialog.Close asChild>
              <button className="p-2 hover:bg-white/10 rounded-lg text-text-secondary transition-colors">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px] bg-background/50">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-text-secondary opacity-50 gap-2">
                <MessageSquare className="w-10 h-10" />
                <p className="text-sm">Start a conversation...</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={clsx(
                    "flex gap-3 max-w-[85%]",
                    msg.role === "user"
                      ? "ml-auto flex-row-reverse"
                      : "mr-auto",
                  )}
                >
                  <div
                    className={clsx(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      msg.role === "user"
                        ? "bg-primary/20 text-primary"
                        : "bg-card border border-border text-text-secondary",
                    )}
                  >
                    {msg.role === "user" ? "U" : "AI"}
                  </div>
                  <div
                    className={clsx(
                      "p-3 rounded-2xl text-sm",
                      msg.role === "user"
                        ? "bg-primary text-white rounded-tr-none"
                        : "bg-card border border-border text-text-primary rounded-tl-none",
                    )}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <span className="text-[10px] opacity-70 block mt-1 text-right">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border/50 bg-card/50 rounded-b-xl">
            {/* Mode Toggles */}
            <div className="flex items-center gap-1 mb-3">
              <button
                onClick={() => setMode("natural")}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2",
                  mode === "natural"
                    ? "bg-primary/20 text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/5",
                )}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Natural Language
              </button>
              <button
                onClick={() => setMode("sql")}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2",
                  mode === "sql"
                    ? "bg-primary/20 text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/5",
                )}
              >
                <Database className="w-3.5 h-3.5" />
                SQL Editor
              </button>
            </div>

            <div className="relative flex items-end gap-2 bg-background border border-border rounded-xl p-2 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={
                  mode === "natural"
                    ? "Describe your database needs (e.g. 'Create users table')..."
                    : "Paste or write your SQL commands here (CREATE, ALTER)..."
                }
                className={clsx(
                  "flex-1 bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-secondary/50 resize-none max-h-32 min-h-[44px] py-3 px-2",
                  mode === "sql" && "font-mono",
                )}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isGenerating}
                className="p-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all mb-0.5"
              >
                {isGenerating ? <LoadingDots /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
