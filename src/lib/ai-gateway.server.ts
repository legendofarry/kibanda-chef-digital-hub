// Server-only helper to call the Lovable AI Gateway (chat completions).
export async function chatCompletion({
  system,
  messages,
  model = "google/gemini-3-flash-preview",
}: {
  system: string;
  messages: { role: "user" | "assistant"; content: string }[];
  model?: string;
}): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY not configured");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("Rate limited. Please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please contact the owner.");
    throw new Error(`AI request failed [${res.status}]: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}
