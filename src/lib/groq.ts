import Groq from "groq-sdk";
import { Parser } from "node-sql-parser";

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "dummy_key_for_build",
});

export const AI_MODEL = "llama-3.3-70b-versatile";

const sqlParser = new Parser();

function cleanSQL(raw: string): string {
  return raw
    .replace(/```sql\n?/gi, "")
    .replace(/```\n?/g, "")
    .replace(/^(Here|Below|The following|This)[^\n]*\n/i, "")
    .trim();
}

function validateSQL(sql: string): { valid: boolean; error?: string } {
  try {
    const ast = sqlParser.astify(sql, { database: "MySQL" });
    const statements = Array.isArray(ast) ? ast : [ast];

    for (const stmt of statements) {
      if (stmt.type !== "create") {
        return {
          valid: false,
          error: `Forbidden SQL statement type: ${stmt.type}. Only CREATE TABLE is allowed.`,
        };
      }
      if ((stmt as any).keyword !== "table") {
        return {
          valid: false,
          error: `Only CREATE TABLE is allowed. Found CREATE ${(stmt as any).keyword}`,
        };
      }
    }

    return { valid: true };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : "Unknown parse error",
    };
  }
}

export async function generateSQLFromPrompt(
  prompt: string,
  currentSchema?: string,
): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing in environment variables.");
  }

  const systemPrompt = `
You are an expert MySQL Database Architect. Generate valid MySQL CREATE TABLE statements from user requests.

STRICT OUTPUT RULES:
- Output ONLY raw SQL text. Never use markdown, code blocks (\`\`\`), or explanations.
- Use ONLY CREATE TABLE statements. Never use ALTER TABLE, DROP TABLE, INSERT, UPDATE, or DELETE.
- If modifying an existing table, output the complete new CREATE TABLE for that table.
- Separate multiple CREATE TABLE statements with a semicolon and newline.

SYNTAX RULES:
- Use standard MySQL syntax compatible with SQL parsers.
- Every table MUST have a PRIMARY KEY (usually \`id INT AUTO_INCREMENT PRIMARY KEY\`).
- Use appropriate types: INT, BIGINT, VARCHAR(n), TEXT, DATETIME, TIMESTAMP, DECIMAL(p,s), TINYINT, JSON.
- Define FOREIGN KEY constraints inline: \`column_name INT, FOREIGN KEY (column_name) REFERENCES other_table(id)\`.
- Use naming convention: table names in snake_case plural (users, blog_posts), columns in snake_case.
- Include common columns where appropriate: \`id\`, \`created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\`.

BEHAVIOR RULES:
- If the request is vague (e.g., "blog system"), design a complete normalized schema with all necessary tables and relationships.
- If the request is non-database related, still respond with a CREATE TABLE that best interprets the user's intent.
- Always follow normalization best practices (3NF minimum).
- When a current schema is provided, preserve existing tables and only add/modify what the user asked for.

EXAMPLE:
User: "I need a blog with users and posts"
Output:
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  published_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
`.trim();

  const userMessage = currentSchema
    ? `Current Schema:\n${currentSchema}\n\nUser Request: ${prompt}`
    : `User Request: ${prompt}`;

  try {
    const firstResult = await callGroq(systemPrompt, userMessage);
    const cleanedSQL = cleanSQL(firstResult);

    const validation = validateSQL(cleanedSQL);
    if (validation.valid) {
      return cleanedSQL;
    }

    console.warn(
      `[AI Recovery] First attempt produced invalid SQL. Retrying... Error: ${validation.error}`,
    );

    const retryMessage = `Your previous output was invalid SQL and could not be parsed.

Parse error: ${validation.error}

Your invalid output was:
${cleanedSQL}

Please fix the SQL syntax issues and return ONLY valid MySQL CREATE TABLE statements. No markdown, no explanations.`;

    const retryResult = await callGroq(systemPrompt, retryMessage);
    return cleanSQL(retryResult);
  } catch (error) {
    console.error("Groq API Error:", error);
    throw error;
  }
}

async function callGroq(
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    model: AI_MODEL,
    temperature: 0,
    max_tokens: 4096,
  });

  return completion.choices[0]?.message?.content || "";
}
