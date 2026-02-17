# ShowIt — Visual Database Architect

> Design, visualize, and generate database schemas with AI assistance.

**ShowIt** is a modern, interactive web application for designing Entity-Relationship Diagrams (ERD). It combines a visual drag-and-drop canvas with a powerful AI-powered SQL generator, a real-time SQL editor, and OAuth authentication — all in a sleek, dark-first interface.

## ✨ Key Features

### 🖱️ Visual ERD Canvas

- Drag-and-drop table nodes with connection handles on all 4 sides
- Zoom, pan, and **auto-layout** (powered by Dagre) for organized diagrams
- Grid toggle for precise placement
- Custom relationship edges between table columns

### 📝 Table & Column Management

- Add/remove tables and columns dynamically
- Edit table and column names with double-click
- Set data types (with length), Primary Key, Foreign Key, and Nullable constraints
- Dropdown with SQL data type tooltips

### 🤖 AI-Powered Schema Generation

- Chat-based interface to describe your database in natural language
- **Groq LLM** (LLaMA 3.3 70B) generates valid MySQL `CREATE TABLE` statements
- **Prompt Enhancement**: AI refines vague prompts into detailed schema descriptions before generation
- **SQL Validation**: Generated SQL is parsed and validated via AST to ensure correctness
- **Security**: Only `CREATE TABLE` statements are allowed — destructive commands (`DROP`, `DELETE`, etc.) are blocked at the AST level
- Chat session history with conversation management (create, load, delete)

### 💻 Real-time SQL Editor

- **Split View Modes**: Visual only | Code only | Split (side-by-side)
- **Syntax Highlighting**: CodeMirror editor with SQL language support
- **2-Way Sync**:
  - Diagram changes auto-generate SQL
  - Manual SQL edits can be applied back to the diagram with "Apply Changes"

### 🔐 Authentication

- **OAuth Login** via GitHub and Google (powered by NextAuth v5)
- Guest access available for unauthenticated users
- Protected API routes — AI endpoints require a valid session

### 📤 Export

- **Export SQL**: Download generated `CREATE TABLE` + `ALTER TABLE` statements as `.sql`
- **Export Image**: Download the diagram as a PNG image

### 🛡️ API Security

- **Rate Limiting**: AI generation endpoint is protected (10 req/min per IP)
- **Input Validation**: Prompt and schema inputs are validated before processing
- **AST-level SQL Filtering**: Only safe DDL statements pass through

## 🛠️ Tech Stack

| Layer                | Technology                           |
| -------------------- | ------------------------------------ |
| **Framework**        | Next.js 15 (App Router)              |
| **Language**         | TypeScript                           |
| **UI Library**       | React 19                             |
| **Styling**          | Tailwind CSS 3                       |
| **State Management** | Zustand (with `persist` middleware)  |
| **Canvas**           | React Flow (`@xyflow/react`)         |
| **Code Editor**      | CodeMirror (`@uiw/react-codemirror`) |
| **AI Provider**      | Groq SDK (LLaMA 3.3 70B Versatile)   |
| **SQL Parser**       | `node-sql-parser` (AST validation)   |
| **Authentication**   | NextAuth v5 (GitHub & Google OAuth)  |
| **Icons**            | Lucide React                         |
| **Components**       | Radix UI (Dialog, Dropdown, Tooltip) |
| **Animation**        | Framer Motion                        |
| **Layout Engine**    | Dagre (auto-layout)                  |
| **Export**           | html-to-image                        |
| **Notifications**    | Sonner (toast)                       |
| **Markdown**         | react-markdown                       |

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── ai/
│   │   │   ├── generate/route.ts # AI SQL generation endpoint
│   │   │   └── enhance/route.ts  # AI prompt enhancement endpoint
│   │   └── auth/
│   │       └── [...nextauth]/    # NextAuth route handler
│   ├── login/page.tsx            # OAuth login page
│   ├── layout.tsx                # Root layout (fonts, providers, toaster)
│   ├── page.tsx                  # Main ERD editor page
│   └── globals.css               # Global styles
├── components/
│   ├── canvas/
│   │   ├── ERDCanvas.tsx         # React Flow canvas
│   │   ├── TableNode.tsx         # Custom table node component
│   │   ├── RelationshipEdge.tsx  # Custom edge component
│   │   └── CanvasToolbar.tsx     # Floating toolbar (zoom, layout, etc.)
│   ├── chat/
│   │   └── ChatView.tsx          # AI chat interface
│   ├── editor/
│   │   └── SQLEditor.tsx         # CodeMirror SQL editor
│   ├── layout/
│   │   ├── Header.tsx            # Top header bar
│   │   ├── MainLayout.tsx        # Main layout with sidebar
│   │   └── SplitView.tsx         # Visual/Code split view
│   ├── sidebar/
│   │   ├── Sidebar.tsx           # Sidebar container
│   │   ├── ChatView.tsx          # Chat session view
│   │   └── HistoryView.tsx       # Chat history view
│   ├── providers/
│   │   └── SessionProvider.tsx   # NextAuth session provider
│   └── ui/
│       ├── ErrorBoundary.tsx     # Error boundary wrapper
│       ├── LoadingDots.tsx       # Loading animation
│       └── tooltip.tsx           # Tooltip component
├── lib/
│   ├── groq.ts                   # Groq AI client, SQL generation & validation
│   └── rate-limit.ts             # In-memory API rate limiter
├── store/
│   └── erdStore.ts               # Zustand store (nodes, edges, chat, settings)
├── types/
│   └── erd.ts                    # TypeScript interfaces (Column, TableData, ChatMessage, ChatSession)
├── constants/
│   ├── dataTypes.ts              # SQL data types definitions
│   └── defaults.ts               # Default nodes and edges
├── utils/
│   ├── sqlGenerator.ts           # Client-side SQL export generator
│   └── sqlParser.ts              # SQL-to-ERD parser
├── hooks/                        # Custom React hooks
└── auth.ts                       # NextAuth configuration (GitHub + Google)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Groq API Key ([Get one at console.groq.com](https://console.groq.com))
- GitHub OAuth credentials ([Developer Settings](https://github.com/settings/developers))
- Google OAuth credentials ([Google Cloud Console](https://console.cloud.google.com))

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd erd

# Install dependencies
npm install

# Copy environment example
cp .env.local.example .env.local
```

### Environment Variables

Edit `.env.local` with your credentials:

```env
# AI Provider
GROQ_API_KEY=your_groq_api_key

# NextAuth
AUTH_SECRET=generate_with_openssl_rand_base64_32
AUTH_URL=http://localhost:3000

# GitHub OAuth
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret

# Google OAuth
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret
```

### Running the App

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) to start designing.

## 💾 Data Model

```typescript
interface Column {
  id: string;
  name: string;
  type: string; // varchar, int, uuid, etc.
  length?: string; // 255, 10, etc.
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isNullable: boolean;
}

interface TableData {
  label: string; // Table name
  columns: Column[];
  headerColor?: string;
  animationDelay?: number;
}

interface ChatMessage {
  id: string;
  role: "user" | "system";
  content: string;
  timestamp: number;
}

interface ChatSession {
  id: string;
  title: string;
  timestamp: number;
  preview: string;
  messages: ChatMessage[];
}
```

## 🎨 Design

- **Dark-first UI** with a modern, premium aesthetic
- **Glassmorphism** cards and subtle gradients
- **Micro-animations** powered by Framer Motion
- **Typography**: Inter (sans-serif) + JetBrains Mono (code)
- **Responsive layout** with collapsible sidebar

## 📄 License

This project is built for learning and development purposes.

---

**Version**: 2.0.0
**Last updated**: February 2026
