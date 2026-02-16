import { NextRequest, NextResponse } from "next/server";
import { groq, AI_MODEL } from "@/lib/groq";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert Database Architect.
Your task is to refine and enhance a user's natural language request for a database schema.
Make the request more detailed, technical, and complete.
Infer necessary columns, relationships, and constraints based on standard software engineering practices.

Rules:
1. Output ONLY the enhanced natural language prompt. No SQL, no explanations, no markdown.
2. Keep it concise but comprehensive.
3. Use clear terminology (e.g., "User table with email, password_hash...", "One-to-many relationship between...")`,
        },
        { role: "user", content: prompt },
      ],
      model: AI_MODEL,
      temperature: 0.3, // Slight creativity allowed for refinement
      max_tokens: 1024,
    });

    const enhancedPrompt = completion.choices[0]?.message?.content || "";
    return NextResponse.json({ enhancedPrompt });
  } catch (error: unknown) {
    console.error("AI Enhance Error:", error);
    return NextResponse.json(
      { error: "Failed to enhance prompt" },
      { status: 500 },
    );
  }
}
