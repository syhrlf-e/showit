import { useState, useRef, useEffect } from "react";
import { useERDStore } from "@/store/erdStore";
import { useAIGenerate } from "@/hooks/useAIGenerate";
import { useEnhancePrompt } from "@/hooks/useEnhancePrompt";
import {
  Send,
  Loader2,
  Sparkles,
  Bot,
  User,
  ChevronDown,
  ChevronUp,
  Copy,
  Pencil,
  Check,
  GitBranch,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { clsx } from "clsx";
import ReactMarkdown from "react-markdown";

export function ChatView() {
  const messages = useERDStore((state) => state.messages);
  const isGenerating = useERDStore((state) => state.isGenerating);
  const setCurrentView = useERDStore((state) => state.setCurrentView);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"natural" | "sql">("natural");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { generate, suggestRelations, isSuggesting } = useAIGenerate();
  const { enhancePrompt, isEnhancing } = useEnhancePrompt();
  const nodes = useERDStore((state) => state.nodes);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  const handleSubmit = async () => {
    if (!prompt.trim() || isGenerating) return;

    const currentPrompt = prompt;
    setPrompt("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    await generate(currentPrompt, mode);
  };

  const handleEnhance = async () => {
    if (!prompt.trim() || isEnhancing) return;
    const enhanced = await enhancePrompt(prompt);
    if (enhanced) {
      setPrompt(enhanced);
      // Auto-resize textarea
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEditStart = (text: string) => {
    setPrompt(text);
    // Auto-resize textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        textareaRef.current.focus();
      }
    }, 0);
  };

  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-sidebar/50 backdrop-blur-sm sticky top-0 z-10">
        <button
          onClick={() => setCurrentView("history")}
          className="flex items-center gap-1 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          <ChevronUp className="w-3 h-3 rotate-[-90deg]" />
          Back to History
        </button>
        <span className="text-xs font-medium text-text-secondary/50">
          Chat Mode
        </span>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
        ref={scrollRef}
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <p className="text-sm">Start chatting to build your ERD</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={clsx(
                "flex flex-col gap-1.5 text-sm group",
                msg.role === "user" ? "items-end" : "items-start",
              )}
            >
              <div
                className={clsx(
                  "rounded-2xl px-4 py-2.5 max-w-[85%] leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary text-white"
                    : "bg-white/5 text-text-primary border border-white/10",
                )}
              >
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>

              {/* Action buttons below bubble for user messages */}
              {msg.role === "user" && (
                <div className="flex items-center gap-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopy(msg.content, msg.id)}
                    className="flex items-center gap-1 px-2 py-0.5 text-xs text-text-secondary hover:text-text-primary hover:bg-white/5 rounded transition-colors"
                    title="Copy"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-green-400" />
                        <span className="text-green-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleEditStart(msg.content)}
                    className="flex items-center gap-1 px-2 py-0.5 text-xs text-text-secondary hover:text-text-primary hover:bg-white/5 rounded transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
        {isGenerating && (
          <div className="flex items-center gap-2 text-text-secondary text-sm pl-12">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Generating schema...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-sidebar">
        <div className="relative flex flex-col gap-2 bg-card/50 border border-border rounded-xl p-3 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={
              mode === "natural"
                ? "Describe your database (e.g. 'e-commerce system')..."
                : "Paste your SQL create statements here..."
            }
            className="w-full bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-secondary/50 resize-none min-h-[40px] max-h-[200px] scrollbar-thin scrollbar-thumb-border"
            rows={1}
          />

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors outline-none">
                    {mode === "natural" ? "Natural Language" : "SQL Input"}
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="z-50 min-w-[140px] bg-card border border-border rounded-lg shadow-xl p-1 animate-in fade-in zoom-in-95 duration-100"
                    align="start"
                    sideOffset={5}
                  >
                    <DropdownMenu.Item
                      onSelect={() => setMode("natural")}
                      className="flex items-center px-2 py-1.5 text-xs rounded-md outline-none cursor-pointer hover:bg-white/5 text-text-primary"
                    >
                      Natural Language
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onSelect={() => setMode("sql")}
                      className="flex items-center px-2 py-1.5 text-xs rounded-md outline-none cursor-pointer hover:bg-white/5 text-text-primary"
                    >
                      SQL Input
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>

              {mode === "natural" && (
                <button
                  onClick={handleEnhance}
                  disabled={!prompt.trim() || isEnhancing}
                  className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium text-purple-400 hover:text-purple-300 hover:bg-purple-400/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Enhance prompt with AI"
                >
                  {isEnhancing ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  Enhance
                </button>
              )}

              {/* Suggest Relations button - only show when there are tables */}
              {nodes.length > 0 && (
                <button
                  onClick={suggestRelations}
                  disabled={isSuggesting || isGenerating}
                  className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Ask AI to suggest missing relations"
                >
                  {isSuggesting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <GitBranch className="w-3 h-3" />
                  )}
                  Suggest
                </button>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!prompt.trim() || isGenerating}
              className="p-2 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white rounded-lg transition-all disabled:cursor-not-allowed text-xs font-medium shadow-lg shadow-primary/20"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        <p className="text-[10px] text-text-secondary/40 text-center mt-2">
          AI can make mistakes. Please verify the generated schema.
        </p>
      </div>
    </div>
  );
}
