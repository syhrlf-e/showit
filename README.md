# AI-Visual Database Architect

## 📋 Deskripsi Sistem

**AI-Visual Database Architect** adalah aplikasi web interaktif untuk mendesain dan memvisualisasikan skema database secara visual menggunakan diagram Entity-Relationship (ERD). Aplikasi ini memungkinkan pengguna membuat, mengedit, dan mengekspor struktur database dengan antarmuka drag-and-drop yang intuitif.

## 🎯 Fitur Utama

### 1. **Visual ERD Canvas**

- Drag-and-drop tabel dengan koneksi antar-entitas
- Zoom, pan, dan auto-layout untuk organisasi diagram
- Grid toggle untuk presisi penempatan
- Handle koneksi di 4 sisi (top, bottom, left, right)

### 2. **Manajemen Tabel & Kolom**

- Tambah/hapus tabel dan kolom secara dinamis
- Edit nama tabel dan kolom dengan double-click
- Dropdown tipe data SQL dengan tooltip deskripsi
- Input panjang data (contoh: `VARCHAR(255)`)
- Toggle Primary Key dan Foreign Key
- Atur nullable/not null per kolom

### 3. **AI-Assisted Generation** _(Simulasi)_

- Input prompt untuk generate skema otomatis
- Template preset (blog, e-commerce, dll)
- History prompt dengan timestamp

### 4. **Export & Persistence**

- **Export SQL**: Generate `CREATE TABLE` statements
- **Export Image**: Download diagram sebagai PNG
- **Auto-save**: State tersimpan di localStorage

### 5. **Theme & UX**

- Dark/Light mode toggle (default: Dark)
- Animasi smooth dengan Framer Motion
- Responsive design dengan Tailwind CSS

## 🛠️ Tech Stack

| Layer                | Teknologi                           |
| -------------------- | ----------------------------------- |
| **Framework**        | Next.js 15 (App Router)             |
| **UI Library**       | React 18, TypeScript                |
| **Styling**          | Tailwind CSS                        |
| **State Management** | Zustand (dengan persist middleware) |
| **Canvas**           | React Flow (@xyflow/react)          |
| **Icons**            | Lucide React                        |
| **Components**       | Radix UI (Dropdown, Tooltip)        |
| **Animation**        | Framer Motion                       |
| **Layout**           | Dagre (auto-layout)                 |
| **Export**           | html-to-image                       |

## 📁 Struktur Proyek

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles
├── components/
│   ├── canvas/
│   │   ├── ERDCanvas.tsx      # React Flow canvas
│   │   ├── TableNode.tsx      # Custom table node
│   │   ├── RelationshipEdge.tsx
│   │   └── CanvasToolbar.tsx  # Floating toolbar
│   ├── layout/
│   │   └── Header.tsx         # Top header (export, login)
│   └── sidebar/
│       ├── AIPanel.tsx        # AI prompt input
│       └── HistoryPanel.tsx   # Prompt history
├── store/
│   └── erdStore.ts        # Zustand state management
├── types/
│   └── erd.ts             # TypeScript interfaces
├── constants/
│   └── dataTypes.ts       # SQL data types list
└── utils/
    └── sqlGenerator.ts    # SQL export logic
```

## 🚀 Cara Menjalankan

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Production build
npm run build
npm start
```

Akses aplikasi di `http://localhost:3000`

## 💾 Data Model

### Column Interface

```typescript
{
  id: string;
  name: string;
  type: string;           // varchar, int, uuid, dll
  length?: string;        // 255, 10,2, dll
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isNullable: boolean;
}
```

### TableData Interface

```typescript
{
  label: string;          // Nama tabel
  columns: Column[];
}
```

## 🎨 Design Highlights

- **Modern UI**: Glassmorphism, gradient accents, smooth transitions
- **Dark-first**: Optimized untuk dark mode dengan light mode support
- **Premium Feel**: Micro-animations, hover effects, shadow layers
- **Accessibility**: Keyboard shortcuts, tooltips, semantic HTML

## 📝 Catatan Pengembangan

- **AI Generation**: Saat ini masih simulasi (template-based), bisa diintegrasikan dengan LLM API
- **Collaboration**: Belum ada fitur real-time collaboration
- **Authentication**: Login button masih placeholder
- **Cloud Sync**: Data hanya tersimpan di localStorage

## 📄 Lisensi

Project ini dibuat untuk keperluan pembelajaran dan pengembangan.

---

**Versi**: 1.0.0  
**Terakhir diupdate**: Februari 2026
