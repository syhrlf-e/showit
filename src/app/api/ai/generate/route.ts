import { NextRequest, NextResponse } from "next/server";
import { generateSQLFromPrompt } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const { prompt, currentSchema } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        {
          error: "API Key Missing",
          details:
            "Please add GROQ_API_KEY to your .env.local file. Get one at console.groq.com.",
        },
        { status: 500 },
      );
    }

    const sql = await generateSQLFromPrompt(prompt, currentSchema);

    // Validate if response is empty
    if (!sql) {
      return NextResponse.json(
        { error: "Failed to generate SQL" },
        { status: 500 },
      );
    }

    return NextResponse.json({ sql });
  } catch (error: unknown) {
    console.error("AI Generation Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
