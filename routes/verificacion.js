const express = require("express");
const router = express.Router();
const Paciente = require("../models/Paciente");
const { enviarCorreo } = require("../utils/email");

// POST: Enviar código al correo
router.post("/enviar-codigo", async (req, res) => {
  const { correo } = req.body;

  try {
    const paciente = await Paciente.findOne({ correo });
    if (!paciente) return res.status(404).json({ message: "Paciente no encontrado" });

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    paciente.codigoVerificacion = codigo;
    await paciente.save();

    await enviarCorreo({
      to: correo,
      subject: "Código de verificación para agendar cita",
      html: `<p>Hola ${paciente.nombreCompleto},</p><p>Tu código de verificación es: <strong>${codigo}</strong></p>`
    });

    res.json({ message: "Código enviado al correo" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error enviando el código" });
  }
});

// POST: Verificar código
router.post("/verificar-codigo", async (req, res) => {
  const { correo, codigo } = req.body;

  try {
    const paciente = await Paciente.findOne({ correo });
    if (!paciente) return res.status(404).json({ message: "Paciente no encontrado" });

    if (paciente.codigoVerificacion === codigo) {
      paciente.codigoVerificacion = null; // Limpiamos código usado
      await paciente.save();
      res.json({ success: true, message: "Código verificado correctamente" });
    } else {
      res.status(400).json({ success: false, message: "Código incorrecto" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error verificando código" });
  }
});

module.exports = router;