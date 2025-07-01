const express = require("express");
const router = express.Router();
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

// Enviar mensaje (usuario) con mock para bot
router.post("/", async (req, res) => {
  try {
    const { user, text } = req.body;

    const message = new Message({ user, text });
    await message.save();

    let botReply = null;

    if (user === "Usuario") {
      // Mock: respuesta simulada sin llamar a OpenAI
      botReply = new Message({
        user: "Bot",
        text: "¡Hola! Soy un bot de prueba. La IA está temporalmente desactivada.",
      });
      await botReply.save();
    }

    res.status(201).json({ userMessage: message, botMessage: botReply });
  } catch (error) {
    console.error("Error al enviar mensaje:", error.message);
    res.status(500).json({ error: "Error al enviar mensaje" });
  }
});

module.exports = router;
