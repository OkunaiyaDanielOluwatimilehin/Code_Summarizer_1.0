export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { inputText } = req.body;

  if (!inputText) {
    return res.status(400).json({ error: "Input text is required." });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You summarize code or programming text." },
          { role: "user", content: inputText }
        ],
        temperature: 0.5,
        max_tokens: 200
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error("Invalid response from OpenAI");
    }

    res.status(200).json({ summary: data.choices[0].message.content.trim() });
  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({ error: error.message || "Failed to summarize." });
  }
}
