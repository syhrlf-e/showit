import { useERDStore } from "@/store/erdStore";
import { MessageSquare, Calendar, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function HistoryView() {
  const sessions = useERDStore((state) => state.sessions);
  const loadSession = useERDStore((state) => state.loadSession);
  const deleteSession = useERDStore((state) => state.deleteSession);
  const createNewChat = useERDStore((state) => state.createNewChat);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-text-primary mb-1">
          Chat History
        </h2>
        <p className="text-xs text-text-secondary">
          Your conversation history with Showit AI
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <MessageSquare className="w-12 h-12 text-text-secondary/20 mb-4" />
            <h3 className="text-sm font-medium text-text-primary">
              No conversations yet
            </h3>
            <p className="text-xs text-text-secondary mt-1 mb-4">
              Start a new chat to generate your database schema.
            </p>
            <button
              onClick={createNewChat}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Start New Chat
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="group relative flex flex-col gap-1 p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-border/50 transition-all cursor-pointer"
                onClick={() => loadSession(session.id)}
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-medium text-text-primary truncate pr-6">
                    {session.title || "Untitled Chat"}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                    className="absolute right-2 top-2 p-1.5 text-text-secondary hover:text-red-400 hover:bg-red-400/10 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete Chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-text-secondary truncate pr-4">
                  {session.preview || "No preview available"}
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-text-secondary/50">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {formatDistanceToNow(session.timestamp, {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
