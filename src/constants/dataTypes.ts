export const SQL_DATA_TYPES = [
  {
    value: "uuid",
    label: "UUID",
    description: "Universally Unique Identifier. Great for primary keys.",
  },
  {
    value: "varchar",
    label: "VARCHAR",
    description: "Variable-length string. Limit 255 chars by default.",
  },
  {
    value: "text",
    label: "TEXT",
    description: "Unlimited length string. Good for descriptions, comments.",
  },
  {
    value: "integer",
    label: "INTEGER",
    description: "Whole numbers (e.g., 1, 100, -5).",
  },
  {
    value: "bigint",
    label: "BIGINT",
    description: "Large whole numbers. Good for counters.",
  },
  {
    value: "decimal",
    label: "DECIMAL",
    description: "Exact decimal numbers. Best for money/currency.",
  },
  { value: "boolean", label: "BOOLEAN", description: "True or False values." },
  { value: "timestamp", label: "TIMESTAMP", description: "Date and time." },
  { value: "date", label: "DATE", description: "Date only (YYYY-MM-DD)." },
  {
    value: "jsonb",
    label: "JSONB",
    description: "Binary JSON data. Good for flexible schemas.",
  },
] as const;
