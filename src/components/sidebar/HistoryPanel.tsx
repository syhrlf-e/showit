import { Clock, Download } from "lucide-react";

export function HistoryPanel() {
  const historyItems = [
    { id: 1, prompt: "Blog system with users and posts", time: "2 mins ago" },
    { id: 2, prompt: "E-commerce database schema", time: "1 hour ago" },
    { id: 3, prompt: "School management system", time: "Yesterday" },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-4 py-2 text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2">
        <Clock className="w-3 h-3" />
        Recent Activity
      </div>
      <div className="flex-1 overflow-y-auto px-2">
        {historyItems.map((item) => (
          <div
            key={item.id}
            className="p-2 hover:bg-white/5 rounded-lg cursor-pointer group transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-text-secondary">{item.time}</span>
              <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all">
                <Download className="w-3 h-3 text-primary" />
              </button>
            </div>
            <p className="text-sm text-text-primary line-clamp-2">
              {item.prompt}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
