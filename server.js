require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.post("/api/chat", async (req, res) => {
  try {
    const messages = req.body.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Please send a message." });
    }

    // Demo mode lets you test the interface before adding an API key.
    if (!process.env.OPENAI_API_KEY) {
      const last = messages[messages.length - 1]?.content || "";
      return res.json({
        reply: `यह Personal AI Pro 2 का demo mode है। आपने पूछा: “${last}”\\n\\nAI जवाब चालू करने के लिए Render में OPENAI_API_KEY environment variable जोड़ें।`
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are Personal AI Pro 2, a helpful, friendly assistant. Reply in the language the user uses." },
          ...messages
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "AI service error." });
    }
    res.json({ reply: data.choices?.[0]?.message?.content || "No response received." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Personal AI Pro 2 running on ${port}`));
