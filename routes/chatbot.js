const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const Cita = require("../models/Cita");
const CodigoVerificacion = require("../models/CodigoVerificacion");
const Paciente = require("../models/paciente");
const { enviarCorreo } = require("../utils/email");
require("dotenv").config();

// Utilidades
const generarCodigo = () => Math.floor(100000 + Math.random() * 900000).toString();

const obtenerHorariosDisponibles = (fecha) => {
  const horariosBase = ["09:00", "11:00", "15:00"];
  return horariosBase.map((hora) => {
    const [h, m] = hora.split(":");
    const fechaHora = new Date(fecha);
    fechaHora.setHours(parseInt(h));
    fechaHora.setMinutes(parseInt(m));
    return fechaHora;
  });
};

// Enviar código de verificación
router.post("/enviar-codigo", async (req, res) => {
  const { correo } = req.body;
  const codigo = generarCodigo();

  try {
    await CodigoVerificacion.findOneAndDelete({ correo });

    await new CodigoVerificacion({ correo, codigo }).save();

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9;">
        <img src="https://www.viorclinic.es/logo.png" alt="Logo ViorClinic" style="max-width: 200px; margin-bottom: 20px;">
        <h2>Tu código de verificación</h2>
        <p>Hola, tu código de verificación es:</p>
        <div style="font-size: 32px; font-weight: bold; color: #2a9d8f;">${codigo}</div>
        <p>Este código expirará en 10 minutos.</p>
        <p style="color: #777;">Gracias por usar ViorClinic.</p>
      </div>
    `;

    await enviarCorreo({
      to: correo,
      subject: "Código de verificación - ViorClinic",
      html,
    });

    res.json({ message: "Código enviado al correo." });
  } catch (err) {
    console.error("Error al enviar código:", err.message);
    res.status(500).json({ error: "Error al enviar código" });
  }
});

// Verificar código y crear cita
router.post("/verificar-codigo", async (req, res) => {
  const { correo, codigo, motivo, fecha, hora } = req.body;

  try {
    const registro = await CodigoVerificacion.findOne({ correo });

    if (!registro || registro.codigo !== codigo) {
      return res.status(400).json({ error: "Código inválido o expirado." });
    }

    const paciente = await Paciente.findOne({ correo });
    if (!paciente) return res.status(404).json({ error: "Paciente no encontrado." });

    const fechaCompleta = new Date(fecha);
    const [horaH, horaM] = hora.split(":");
    fechaCompleta.setHours(parseInt(horaH));
    fechaCompleta.setMinutes(parseInt(horaM));

    const cita = new Cita({
      paciente: paciente._id,
      fecha: fechaCompleta,
      motivo,
    });

    await cita.save();
    await CodigoVerificacion.deleteOne({ correo });

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: #f2f4f8;">
        <img src="https://www.viorclinic.es/logo.png" alt="Logo ViorClinic" style="max-width: 180px; margin-bottom: 20px;">
        <h2 style="color: #264653;">¡Cita confirmada!</h2>
        <p>Hola ${paciente.nombre},</p>
        <p>Tu cita ha sido agendada exitosamente con la siguiente información:</p>
        <ul style="list-style: none; padding-left: 0;">
          <li><strong>Motivo:</strong> ${motivo}</li>
          <li><strong>Fecha:</strong> ${fechaCompleta.toLocaleDateString()}</li>
          <li><strong>Hora:</strong> ${hora}</li>
        </ul>
        <p style="margin-top: 20px;">Gracias por confiar en ViorClinic.</p>
      </div>
    `;

    await enviarCorreo({
      to: correo,
      subject: "Confirmación de cita - ViorClinic",
      html,
    });

    res.status(201).json({ message: "Cita creada y correo enviado.", cita });
  } catch (error) {
    console.error("Error al verificar código:", error.message);
    res.status(500).json({ error: "Error al crear cita" });
  }
});

// Mensajes normales
router.get("/", async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener mensajes" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { user, text } = req.body;
    const message = new Message({ user, text });
    await message.save();

    let botReply = null;

    if (user === "Usuario") {
      botReply = new Message({
        user: "Bot",
        text: "¡Hola! Soy tu asistente. Puedes agendar una cita conmigo. ¿Quieres comenzar?",
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
