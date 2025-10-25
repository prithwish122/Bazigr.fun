export const dynamic = "force-dynamic";

import { marked } from "marked";

type ChatMessage = { role: "user" | "assistant"; content: string };

function buildFallbackReply(input: string): string {
  const text = (input || "").toLowerCase();
  if (!text) return "Hello! How can I help you with Bazigr today?";
  if (/hi|hello|hey/.test(text)) return "Hello! Ask me to swap, send or bridge. For example: swap 1 CELO to BAZ.";
  if (/wallet|address/.test(text)) return "I can't read your wallet from the server. In the app header, connect your wallet; your address will show there.";
  if (/swap|exchange/.test(text)) return "To swap: 'swap 1 CELO to BAZ' or 'swap 100 BAZ to CELO'. The agent input will execute it.";
  if (/send|transfer/.test(text)) return "To send: 'send 5 BAZ to 0x...' or 'send 0.1 CELO to 0x...'.";
  if (/bridge/.test(text)) return "To bridge: 'bridge 10 BAZ from CELO to sepolia' or 'bridge 5 BAZ from sepolia to CELO'. Specify both source and destination networks.";
  return "Got it. You can ask me to swap, send, or bridge using natural language.";
}

async function callGemini(messages: ChatMessage[]): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("Gemini API Key present:", !!apiKey);
  if (!apiKey) {
    console.log("No Gemini API key found");
    return null;
  }
  try {
    // Add system message to make AI more helpful and open
    const systemMessage = {
      role: "user",
      parts: [{ text: "You are Bazigr Agent, a helpful AI assistant for the Bazigr DeFi platform. While you specialize in Bazigr operations like swapping, sending, and bridging tokens, you are also knowledgeable about many other topics and happy to help with general questions. Only introduce yourself as 'Bazigr Agent' in your first response to a new conversation, then just answer questions naturally without repeating your identity. Feel free to answer any question the user asks - whether it's about Bazigr, blockchain, general knowledge, or anything else!" }]
    };

    const contents = [systemMessage, ...(messages || []).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }))];

    console.log("Calling Gemini API with:", contents);
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      }
    );
    console.log("Gemini API response status:", res.status);
    if (!res.ok) {
      const errorText = await res.text();
      console.log("Gemini API error:", errorText);
      return null;
    }
    const data = await res.json();
    console.log("Gemini API response data:", data);
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;
    console.log("Extracted text:", text);

    if (text) {
      // Render markdown to HTML
      const htmlContent = marked(text);
      return htmlContent;
    }
    return null;
  } catch (error) {
    console.log("Gemini API call error:", error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    let body: { messages?: ChatMessage[] } = {};
    try {
      body = await req.json();
    } catch { }
    const msgs = body?.messages || [];
    const last = msgs.length > 0 ? msgs[msgs.length - 1] : undefined;

    // Try Gemini if key present; fallback to local reply
    console.log("Processing request with messages:", msgs);
    const geminiText = await callGemini(msgs);
    console.log("Gemini response:", geminiText);
    const reply = geminiText ?? buildFallbackReply(last?.content ?? "");
    console.log("Final reply:", reply);

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


