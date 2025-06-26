const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// Obtener mensajes
router.get("/", async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 }); // orden cronológico
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

    // Aquí puedes agregar lógica para respuesta automática del bot (simple ejemplo abajo)
    if (user === "Usuario") {
      // Respuesta bot automática
      const botResponse = new Message({
        user: "Bot",
        text: "¡Gracias por tu mensaje! En breve te responderemos.",
      });
      await botResponse.save();
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: "Error al enviar mensaje" });
  }
});

module.exports = router;