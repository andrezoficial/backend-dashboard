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

    // Formatear la fecha para mostrar bonita en el correo
    const fechaFormateada = fechaCita.toLocaleString("es-CO", {
      dateStyle: "full",
      timeStyle: "short",
    });

    // Enviar correo con diseño profesional y bonito
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; border-radius: 10px; padding: 20px; max-width: 600px; margin: auto; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <img src="https://www.viorclinic.es/logo192.png" alt="Logo ViorClinic" style="max-width: 150px; display: block; margin: 0 auto 20px;">
          <h2 style="text-align: center; color: #007bff;">¡Tu cita ha sido confirmada!</h2>
          <p>Hola <strong>${pacienteEncontrado.nombreCompleto}</strong>,</p>
          <p>Tu cita en <strong>ViorClinic</strong> ha sido programada correctamente.</p>
          <p><strong>📅 Fecha:</strong> ${fechaFormateada}<br>
             <strong>📝 Motivo:</strong> ${motivo.toLowerCase()}</p>
          <p>Por favor llega con al menos 10 minutos de anticipación. Si necesitas reprogramar, contáctanos con tiempo.</p>
          <p style="margin-top: 30px;">Gracias por confiar en nosotros,</p>
          <p><strong>Equipo ViorClinic</strong></p>
        </div>
      </div>
    `;

    await enviarCorreo({
      to: pacienteEncontrado.correo,
      subject: "Confirmación de Cita - ViorClinic",
      html,
    });

    res.status(201).json(nuevaCita);
  } catch (error) {
    console.error("Error al crear cita:", error);
    res.status(500).json({ message: "Error al registrar la cita", error });
  }
});

module.exports = router;
