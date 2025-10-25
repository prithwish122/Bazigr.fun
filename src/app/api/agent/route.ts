export const dynamic = "force-dynamic";

type ChatMessage = { role: "user" | "assistant"; content: string };

function buildFallbackReply(input: string): string {
  const text = (input || "").toLowerCase();
  if (!text) return "Hello! How can I help you with Bazigr today?";
  if (/hi|hello|hey/.test(text)) return "Hello! Ask me to swap, send or bridge. For example: swap 1 U2U to BAZ.";
  if (/wallet|address/.test(text)) return "I can't read your wallet from the server. In the app header, connect your wallet; your address will show there.";
  if (/swap|exchange/.test(text)) return "To swap: 'swap 1 U2U to BAZ' or 'swap 100 BAZ to U2U'. The agent input will execute it.";
  if (/send|transfer/.test(text)) return "To send: 'send 5 BAZ to 0x...' or 'send 0.1 U2U to 0x...'.";
  if (/bridge/.test(text)) return "To bridge: 'bridge 10 BAZ from u2u to sepolia' or 'bridge 5 BAZ from sepolia to u2u'. Specify both source and destination networks.";
  return "Got it. You can ask me to swap, send, or bridge using natural language.";
}

async function callGemini(messages: ChatMessage[]): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    const contents = (messages || []).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;
    return text || null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    let body: { messages?: ChatMessage[] } = {};
    try {
      body = await req.json();
    } catch {}
    const msgs = body?.messages || [];
    const last = msgs.length > 0 ? msgs[msgs.length - 1] : undefined;

    // Try Gemini if key present; fallback to local reply
    const geminiText = await callGemini(msgs);
    const reply = geminiText ?? buildFallbackReply(last?.content ?? "");

    return new Response(JSON.stringify({ text: reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ text: "Sorry, something went wrong." }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}


