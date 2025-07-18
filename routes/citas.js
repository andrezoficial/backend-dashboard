const express = require("express");
const router = express.Router();
const Cita = require("../models/Cita");
const Paciente = require("../models/paciente");
const { enviarCorreo } = require("../utils/email");
const ics = require("ics");

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
      .populate("paciente", "nombreCompleto correo")
      .exec();
    res.json(citas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener citas" });
  }
});

// Endpoint para obtener motivos válidos
router.get("/motivos", (req, res) => {
  res.json(MOTIVOS_VALIDOS);
});

// Crear nueva cita
router.post("/", async (req, res) => {
  try {
    const { paciente, fecha, motivo } = req.body;

    if (!paciente || !fecha || !motivo) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    if (!MOTIVOS_VALIDOS.includes(motivo.toLowerCase())) {
      return res.status(400).json({ message: "Motivo inválido" });
    }

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

    // Crear evento .ics
    const fechaICS = new Date(fecha);
    const event = {
      start: [
        fechaICS.getFullYear(),
        fechaICS.getMonth() + 1,
        fechaICS.getDate(),
        fechaICS.getHours(),
        fechaICS.getMinutes(),
      ],
      duration: { hours: 1 },
      title: `Cita médica - ${motivo}`,
      description: `Cita médica en ViorClinic para el paciente ${pacienteEncontrado.nombreCompleto}`,
      location: "ViorClinic, Calle 123, Bogotá",
      status: "CONFIRMED",
      organizer: { name: "ViorClinic", email: "no-reply@viorclinic.es" },
    };

    ics.createEvent(event, async (error, value) => {
      if (error) {
        console.error("Error generando archivo .ics:", error);
      }

      // Enviar correo de confirmación
      await enviarCorreo({
        to: pacienteEncontrado.correo,
        subject: "Confirmación de Cita - ViorClinic",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <div style="text-align: center;">
              <img src="https://www.viorclinic.es/logo192.png" alt="ViorClinic" style="max-width: 150px; margin-bottom: 20px;" />
            </div>
            <h2 style="color: #2F855A;">¡Hola ${pacienteEncontrado.nombreCompleto}!</h2>
            <p>Tu cita ha sido registrada con éxito en <strong>ViorClinic</strong>.</p>
            <p><strong>Motivo:</strong> ${motivo.toLowerCase()}</p>
            <p><strong>Fecha:</strong> ${fechaICS.toLocaleString("es-CO")}</p>
            <br/>
            <p style="color: #555;">Adjuntamos un archivo para que puedas agregar la cita a tu calendario.</p>
            <br/>
            <p style="font-size: 13px; color: #888;">Si tienes dudas o necesitas reprogramar, contáctanos a soporte@viorclinic.es.</p>
            <hr/>
            <p style="text-align: center; font-size: 12px; color: #aaa;">© ${new Date().getFullYear()} ViorClinic. Todos los derechos reservados.</p>
          </div>
        `,
        attachments: [
          {
            filename: "cita-viorclinic.ics",
            content: value,
            contentType: "text/calendar"
          }
        ]
      });

      res.status(201).json(nuevaCita);
    });
  } catch (error) {
    console.error("Error al crear cita:", error);
    res.status(500).json({ message: "Error al registrar la cita", error });
  }
});

module.exports = router;
