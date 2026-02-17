/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        sidebar: "#111111",
        card: "#1a1a1a",
        border: "#2a2a2a",
        primary: "#3b82f6",
        success: "#10b981",
        text: {
          primary: "#ffffff",
          secondary: "#a3a3a3",
        },
      },
      fontFamily: {
        sans: ["var(--font-satoshi)", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
