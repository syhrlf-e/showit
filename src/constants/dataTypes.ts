export const SQL_DATA_TYPES = [
  {
    value: "int",
    label: "INT",
    description: "Whole numbers (e.g., 1, 100, -5). MySQL standard.",
  },
  {
    value: "varchar",
    label: "VARCHAR",
    description: "Variable-length string. Specify length like VARCHAR(255).",
  },
  {
    value: "text",
    label: "TEXT",
    description: "Long text content. Good for descriptions, comments.",
  },
  {
    value: "char",
    label: "CHAR",
    description: "Fixed-length string. Use CHAR(36) for UUIDs.",
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
  {
    value: "tinyint",
    label: "TINYINT",
    description: "Small integers (0-255). Often used for boolean (0/1).",
  },
  {
    value: "datetime",
    label: "DATETIME",
    description: "Date and time (YYYY-MM-DD HH:MM:SS).",
  },
  {
    value: "timestamp",
    label: "TIMESTAMP",
    description: "Auto-updating timestamp.",
  },
  {
    value: "date",
    label: "DATE",
    description: "Date only (YYYY-MM-DD).",
  },
  {
    value: "json",
    label: "JSON",
    description: "JSON data (MySQL 5.7+). For flexible schemas.",
  },
] as const;
