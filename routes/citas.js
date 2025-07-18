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

// Obtener todas las citas con datos completos del paciente
router.get("/", async (req, res) => {
  try {
    const citas = await Cita.find()
      .populate("paciente", "nombreCompleto correo") // ajusta campos que necesites mostrar
      .exec();
    res.json(citas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener citas" });
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

    if (!paciente || !fecha || !motivo) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    // Validación de motivo (minusculas para evitar error)
    if (!MOTIVOS_VALIDOS.includes(motivo.toLowerCase())) {
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

    const nuevaCita = new Cita({ paciente, fecha, motivo: motivo.toLowerCase() });
    await nuevaCita.save();

    // Enviar correo de confirmación
    await enviarCorreo({
      to: pacienteEncontrado.correo,
      subject: "Confirmación de Cita - ViorClinic",
      html: `
        <h2>Hola ${pacienteEncontrado.nombreCompleto},</h2>
        <p>Tu cita ha sido registrada con éxito.</p>
        <p><strong>Motivo:</strong> ${motivo.toLowerCase()}</p>
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
