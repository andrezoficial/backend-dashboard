const express = require("express");
const router = express.Router();
const Cita = require("../models/Cita");
const Paciente = require("../models/paciente");
const { enviarCorreo } = require("../utils/email");

const MOTIVOS_VALIDOS = [
  "medicina general",
  "odontología",
  "optometría",
  "medicina con especialistas",
  "laboratorios"
];

// Obtener todas las citas
router.get("/", async (req, res) => {
  try {
    const citas = await Cita.find().populate("paciente", "nombre correo");
    res.json(citas);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las citas", error });
  }
});

// Endpoint para obtener los motivos válidos
router.get("/motivos", (req, res) => {
  res.json(MOTIVOS_VALIDOS);
});

// Crear una nueva cita
router.post("/", async (req, res) => {
  try {
    const { paciente, fecha, motivo } = req.body;

    // Validación de motivo
    if (!MOTIVOS_VALIDOS.includes(motivo)) {
      return res.status(400).json({ message: "Motivo inválido" });
    }

    // Validación de fecha futura
    const fechaCita = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fechaCita < hoy) {
      return res.status(400).json({ message: "No puedes seleccionar una fecha pasada" });
    }

    const pacienteEncontrado = await Paciente.findById(paciente);
    if (!pacienteEncontrado) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }

    const nuevaCita = new Cita({ paciente, fecha, motivo });
    await nuevaCita.save();

    // Enviar correo de confirmación
    await enviarCorreo({
      to: pacienteEncontrado.correo,
      subject: "Confirmación de Cita - ViorClinic",
      html: `
        <h2>Hola ${pacienteEncontrado.nombre},</h2>
        <p>Tu cita ha sido registrada con éxito.</p>
        <p><strong>Motivo:</strong> ${motivo}</p>
        <p><strong>Fecha:</strong> ${new Date(fecha).toLocaleString("es-CO")}</p>
        <br>
        <p>Gracias por confiar en ViorClinic.</p>
      `
    });

    res.status(201).json(nuevaCita);
  } catch (error) {
    console.error("Error al crear cita:", error);
    res.status(500).json({ message: "Error al registrar la cita", error });
  }
});

module.exports = router;
