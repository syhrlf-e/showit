import { NextRequest, NextResponse } from "next/server";
import { suggestRelationsFromSchema } from "@/lib/groq";
import { auth } from "@/auth";
import { rateLimiter } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const allowed = await rateLimiter.check(10, ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      { status: 429 },
    );
  }

  try {
    const { schema } = await req.json();

    if (!schema) {
      return NextResponse.json(
        { error: "Schema is required" },
        { status: 400 },
      );
    }

    const suggestions = await suggestRelationsFromSchema(schema);
    return NextResponse.json({ suggestions });
  } catch (error: unknown) {
    console.error("Suggest Relations Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
