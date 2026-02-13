Create a modern web application for AI-Visual Database Architect
with the following layout and features:

LAYOUT STRUCTURE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. HEADER (Top bar - 64px height)
   - Logo + App name on left
   - Actions on right: [Export SQL] [Save Project] [Settings]
   - Dark theme with subtle gradient

2. MAIN LAYOUT (Split view - 70/30 or 75/25)

   LEFT SIDEBAR (30% width, 400px min):
   ─────────────────────────────────────

   A. Input Section (Top)
   • Large textarea for natural language input
   • Placeholder: "Describe your database... (e.g., 'Create a blog system with users, posts, and comments')"
   • [Generate ERD] button (Primary CTA - prominent)
   • Toggle: [Natural Language] / [SQL Mode]

   B. Quick Actions (Middle)
   • [Add Table] button
   • [Import SQL] button  
    • [Load Template] dropdown

   C. History Panel (Bottom - scrollable)
   • List of previous generations
   • Each item shows: - Timestamp - Prompt preview (truncated) - Thumbnail of ERD - [Load] button

   D. AI Suggestions (Collapsible)
   • "💡 Suggested improvements"
   • List of normalization tips
   • Click to apply

   RIGHT CANVAS (70% width, flex-grow):
   ─────────────────────────────────────

   A. Toolbar (Top of canvas)
   • [Zoom In] [Zoom Out] [Fit View] [Auto Layout]
   • [Grid Toggle] [Dark/Light Mode]
   • Export: [PNG] [SQL] [JSON]

   B. Infinite Canvas Area
   • Background: Subtle dot grid pattern
   • Interactive drag & drop
   • Smooth zoom and pan
   • Tables appear as rounded cards with shadow

   C. Minimap (Bottom-right corner)
   • Small overview of entire schema
   • Current viewport indicator

3. TABLE NODES (Card design)
   ─────────────────────────────────────
   Each table card should have:

   Header:
   • Table name (editable on click)
   • Icon indicating table type
   • [⋮] Menu (edit, delete, duplicate)

   Body (Column list):
   • Each column shows:
   - 🔑 (if Primary Key)
   - Column name
   - Data type (smaller, muted)

   Footer:
   • Row count estimate
   • Relationship handles (connection points)

4. RELATIONSHIPS (Edges/Lines)
   ─────────────────────────────────────
   • Smooth curved lines
   • Arrow indicating direction
   • Label on hover: "one-to-many", "many-to-many"
   • Color-coded:
   - Blue: one-to-one
   - Green: one-to-many
   - Purple: many-to-many

DESIGN SYSTEM:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Colors (Dark theme):

- Background: #0a0a0a
- Sidebar: #111111
- Cards: #1a1a1a
- Borders: #2a2a2a
- Primary: #3b82f6 (blue)
- Success: #10b981 (green)
- Text primary: #ffffff
- Text secondary: #a3a3a3

Typography:

- Font: Inter or SF Pro
- Headings: 600 weight
- Body: 400 weight
- Code: JetBrains Mono

Spacing:

- Use 8px grid system
- Card padding: 16px
- Section gaps: 24px

Interactions:

- Hover states: Subtle scale (1.02) + glow
- Focus: Blue ring
- Transitions: 200ms ease-out
- Loading: Skeleton + shimmer effect

SPECIAL FEATURES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Real-time Typing Indicator
   - "Generating schema..." with animated dots
   - Progress bar during AI processing

2. Empty States
   - When canvas is empty:
     "Start by describing your database or choose a template"
   - Illustration + Quick start tips

3. Tooltips
   - Hover over FK: Show related table
   - Hover over column: Show constraints

4. Keyboard Shortcuts Panel
   - Cmd/Ctrl + K: Focus input
   - Cmd/Ctrl + S: Save
   - Cmd/Ctrl + E: Export
   - Space: Pan mode
   - Delete: Remove selected

5. Responsive Behavior
   - Mobile: Stack sidebar on top
   - Tablet: Collapsible sidebar
   - Desktop: Full split view

REFERENCES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Similar to:

- Excalidraw (for canvas feel)
- Linear (for sidebar UX)
- Figma (for infinite canvas)
- dbdiagram.io (for ERD style)

Tech Stack Hints:

- Use React Flow for canvas
- Tailwind CSS for styling
- Framer Motion for animations
- Radix UI for components
