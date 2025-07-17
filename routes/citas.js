const express = require("express");
const router = express.Router();
const Cita = require("../models/Cita");
const Paciente = require("../models/paciente");
const { enviarCorreo } = require("../utils/email"); 

// Crear cita y enviar correo
router.post("/", async (req, res) => {
  try {
    const { paciente, motivo, fecha } = req.body;

    const nuevaCita = new Cita({ paciente, motivo, fecha });
    await nuevaCita.save();

    const pacienteData = await Paciente.findById(paciente);

    if (pacienteData && pacienteData.correo) {
      const html = `
        <p>Hola ${pacienteData.nombreCompleto},</p>
        <p>Su cita ha sido agendada con éxito.</p>
        <p><strong>Motivo:</strong> ${motivo}</p>
        <p><strong>Fecha y hora:</strong> ${new Date(fecha).toLocaleString()}</p>
        <p>Gracias por confiar en ViorClinic.</p>
      `;

      enviarCorreo({
        to: pacienteData.correo,
        subject: "Confirmación de cita médica - ViorClinic",
        html,
      }).then(() => {
        console.log("Correo de confirmación enviado");
      }).catch(err => {
        console.error("Error enviando correo:", err);
      });
    }

    res.status(201).json({ message: "Cita registrada correctamente", cita: nuevaCita });
  } catch (error) {
    console.error("Error al guardar cita:", error);
    res.status(500).json({ message: "Error al registrar cita" });
  }
});

// resto de rutas igual...

module.exports = router;
