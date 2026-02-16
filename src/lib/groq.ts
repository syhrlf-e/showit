import Groq from "groq-sdk";

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "dummy_key_for_build",
});

export const AI_MODEL = "llama-3.3-70b-versatile"; // Or "llama3-70b-8192" based on availability

export async function generateSQLFromPrompt(
  prompt: string,
  currentSchema?: string,
): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing in environment variables.");
  }

  const systemPrompt = `
You are an expert Database Architect and SQL Developer. 
Your task is to generate valid MySQL SQL code based on the user's natural language request.

Rules:
1. Return ONLY the SQL code. No markdown, no explanations, no code blocks like \`\`\`sql.
2. Use valid MySQL syntax.
3. If the user asks for a specific table or feature, generate a complete CREATE TABLE statement.
4. If the user provides an existing schema, generate SQL to MODIFY or ADD to it (ALTER TABLE or CREATE TABLE).
5. Use appropriate data types (INT, VARCHAR, TEXT, DATETIME, BOOLEAN, etc.).
6. Define Primary Keys and Foreign Keys correctly.
7. If the request is vague, verify with best practices for database design.
8. Do NOT wrap output in markdown code blocks. Just raw SQL text.
`.trim();

  const userMessage = currentSchema
    ? `Current Schema:\n${currentSchema}\n\nUser Request: ${prompt}`
    : `User Request: ${prompt}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      model: AI_MODEL,
      temperature: 0.1, // Low temperature for deterministic code
      max_tokens: 2048,
    });

    const content = completion.choices[0]?.message?.content || "";
    // Clean up any markdown code blocks if the model ignores the rule
    return content
      .replace(/```sql\n?/g, "")
      .replace(/```/g, "")
      .trim();
  } catch (error) {
    console.error("Groq API Error:", error);
    throw error;
  }
}
