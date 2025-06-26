const express = require("express");
const router = express.Router();
const axios = require("axios");
const Message = require("../models/Message");
require("dotenv").config();

// Obtener mensajes
router.get("/", async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener mensajes" });
  }
});

// Enviar mensaje (usuario)
router.post("/", async (req, res) => {
  try {
    const { user, text } = req.body;

    const message = new Message({ user, text });
    await message.save();

    let botReply = null;

    if (user === "Usuario") {
      // Llamada a OpenAI
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: text }],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const reply = response.data.choices[0].message.content;

      botReply = new Message({
        user: "Bot",
        text: reply,
      });

      await botReply.save();
    }

    res.status(201).json({ userMessage: message, botMessage: botReply });
  } catch (error) {
    console.error("Error al enviar mensaje:", error.response?.data || error.message);
    res.status(500).json({ error: "Error al enviar mensaje" });
  }
});

module.exports = router;
