import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };
const allowedModes = ["all", "personal", "business", "coding", "research", "automation"];

const modeInstructions: Record<string, string> = {
  all: "Identify whether the task is personal, business, coding, research, or automation. State a concise plan before giving the useful result.",
  personal: "Act as a practical personal assistant. Help with planning, organization, learning, and everyday tasks.",
  business: "Act as a practical small-business operations strategist. Focus on customers, leads, sales, service, costs, and measurable execution.",
  coding: "Act as a senior software engineer. Explain assumptions, provide correct code, and include testing steps.",
  research: "Act as a careful research analyst. Separate facts from assumptions and mention when information needs current verification.",
  automation: "Act as an automation architect. Break workflows into triggers, actions, conditions, integrations, and failure handling."
};

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI engine is not connected yet. Add GEMINI_API_KEY in your deployment environment variables, then redeploy." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const messages = body.messages as ChatMessage[];
    const mode = typeof body.mode === "string" && allowedModes.includes(body.mode) ? body.mode : "all";

    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 30) {
      return NextResponse.json({ error: "Please send between 1 and 30 messages." }, { status: 400 });
    }

    const validMessages = messages.every((message) =>
      message &&
      (message.role === "user" || message.role === "assistant") &&
      typeof message.content === "string" &&
      message.content.length > 0 &&
      message.content.length <= 12000
    );

    if (!validMessages) {
      return NextResponse.json({ error: "Invalid message format or message too long." }, { status: 400 });
    }

    const model = process.env.GEMINI_MODEL || "gemini-flash-latest";
    const systemPrompt = [
      "You are ALICE, a capable and honest agentic AI assistant.",
      "Your job is to understand the user's goal, plan useful steps, and produce practical results.",
      "Do not claim to have browsed websites, changed files, sent messages, made purchases, deployed code, or executed external actions unless a connected tool actually did it.",
      "When a task requires an external action and no tool is connected, explain the exact next step instead of pretending it is complete.",
      "Ask for confirmation before consequential actions such as sending, publishing, deleting, purchasing, or changing account settings.",
      "Protect credentials and private data. Never ask users to paste secret API keys into chat.",
      "Use clear, concise language. Match the user's language where practical.",
      "Current work mode: " + mode + ". " + modeInstructions[mode]
    ].join("\n");

    const contents = messages.map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }]
    }));

    const apiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: { temperature: 0.6, maxOutputTokens: 1800 }
        }),
        signal: AbortSignal.timeout(45000)
      }
    );

    const result = await apiResponse.json();
    if (!apiResponse.ok) {
      const message = result?.error?.message || "The AI provider returned an error.";
      return NextResponse.json({ error: message }, { status: apiResponse.status });
    }

    const reply = result?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || "")
      .join("")
      .trim();

    if (!reply) {
      return NextResponse.json({ error: "The AI returned an empty response. Please try again." }, { status: 502 });
    }

    return NextResponse.json({ reply, model });
  } catch (error) {
    const message = error instanceof Error && error.name === "TimeoutError"
      ? "The AI request timed out. Please try again."
      : "Unable to process the request right now.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
