<p align="center">
  <h1 align="center">ShowIt</h1>
  <p align="center">
    A visual database schema designer with AI-assisted generation.
    <br />
    <a href="https://github.com/syhrlf-e/showit"><strong>View Repository »</strong></a>
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

---

ShowIt lets you design database schemas visually through a drag-and-drop canvas, then generate production-ready MySQL DDL from it. You can also describe what you need in plain language and let the AI build the schema for you.

Built with Next.js 15 App Router, React Flow for the canvas, and Groq (LLaMA 3.3 70B) for schema generation.

## What it does

- **Drag-and-drop ERD canvas** — create tables, connect columns, auto-layout with Dagre
- **AI schema generation** — describe your database in natural language, get valid `CREATE TABLE` output
- **Live SQL editor** — CodeMirror-powered editor with two-way sync between diagram and SQL
- **Export** — download your schema as `.sql` or the diagram as `.png`
- **Auth** — sign in via GitHub or Google. Guest access is also available

## Quick start

```bash
git clone https://github.com/syhrlf-e/showit.git
cd showit
npm install
cp .env.local.example .env.local
```

Fill in `.env.local`:

```env
GROQ_API_KEY=           # https://console.groq.com
AUTH_SECRET=            # openssl rand -base64 32
AUTH_URL=http://localhost:3000

AUTH_GITHUB_ID=         # https://github.com/settings/developers
AUTH_GITHUB_SECRET=
AUTH_GOOGLE_ID=         # https://console.cloud.google.com
AUTH_GOOGLE_SECRET=
```

Then run:

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000).

## Stack

|             |                                       |
| ----------- | ------------------------------------- |
| Framework   | Next.js 15, React 19, TypeScript      |
| Canvas      | React Flow (`@xyflow/react`)          |
| Editor      | CodeMirror (`@uiw/react-codemirror`)  |
| AI          | Groq SDK — LLaMA 3.3 70B              |
| Auth        | NextAuth v5 (GitHub, Google)          |
| State       | Zustand with localStorage persistence |
| Styling     | Tailwind CSS, Framer Motion           |
| SQL Parsing | `node-sql-parser`                     |
| Layout      | Dagre                                 |
| UI          | Radix UI, Lucide icons, Sonner toasts |

## Project structure

```
src/
├── app/
│   ├── api/ai/          # generate/ and enhance/ endpoints
│   ├── api/auth/        # NextAuth route handler
│   ├── login/           # OAuth login page
│   ├── layout.tsx
│   └── page.tsx         # main editor
├── components/
│   ├── canvas/          # ERDCanvas, TableNode, RelationshipEdge, CanvasToolbar
│   ├── chat/            # AI chat interface
│   ├── editor/          # SQL editor (CodeMirror)
│   ├── layout/          # Header, MainLayout, SplitView
│   ├── sidebar/         # Sidebar, ChatView, HistoryView
│   ├── providers/       # SessionProvider
│   └── ui/              # ErrorBoundary, LoadingDots, Tooltip
├── lib/
│   ├── groq.ts          # AI client + SQL validation
│   └── rate-limit.ts    # API rate limiter
├── store/
│   └── erdStore.ts      # Zustand store
├── types/
│   └── erd.ts           # Column, TableData, ChatMessage, ChatSession
├── utils/
│   ├── sqlGenerator.ts  # diagram → SQL
│   └── sqlParser.ts     # SQL → diagram
├── constants/           # data types, defaults
├── hooks/
└── auth.ts              # NextAuth config
```

## How the AI works

1. User types a prompt like _"e-commerce system with users, products, and orders"_
2. The prompt is optionally enhanced via `/api/ai/enhance` to make it more specific
3. `/api/ai/generate` sends it to Groq with a MySQL-specialized system prompt
4. The response is cleaned, then parsed into an AST using `node-sql-parser`
5. Only `CREATE TABLE` statements pass validation — anything else (`DROP`, `DELETE`, etc.) is rejected
6. Valid SQL is parsed into nodes and rendered on the canvas

## Security

- **Authentication** — all AI endpoints require a valid session
- **Rate limiting** — 10 requests per minute per IP on generation endpoints
- **SQL validation** — AST-level filtering blocks destructive statements
- **Secrets** — all credentials stored as environment variables, never committed

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Production build         |
| `npm start`     | Start production server  |
| `npm run lint`  | Run ESLint               |

## Contributing

1. Fork the repo
2. Create your branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push and open a PR

## License

MIT

---

Built by [@syhrlf-e](https://github.com/syhrlf-e)
