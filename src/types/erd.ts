export interface Column {
  id: string;
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isNullable: boolean;
  length?: string;
}

export interface TableData extends Record<string, unknown> {
  label: string;
  columns: Column[];
  headerColor?: string;
  animationDelay?: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "system" | "assistant";
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: number;
  preview: string;
  messages: ChatMessage[];
}
