export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "Falta OPENAI_API_KEY en .env.local" }, { status: 500 });
    }

    // Usamos un modelo disponible por API (evita el error de 'gpt-4' sin acceso)
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages,
        temperature: 0.4,
        max_tokens: 300,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json(
        { error: data?.error?.message || "Error OpenAI", raw: data },
        { status: res.status }
      );
    }

    const content = data?.choices?.[0]?.message?.content ?? "Sin respuesta.";
    return Response.json({ content });
  } catch (e) {
    return Response.json(
      { error: e?.message || "Error desconocido" },
      { status: 500 }
    );
  }
}
