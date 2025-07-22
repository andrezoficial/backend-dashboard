const express = require("express");
const router = express.Router();
const HistoriaClinica = require("../models/HistoriaClinica");
const Cup = require("../models/Cups");
const Paciente = require("../models/paciente");  // Importación del modelo Paciente

// GET /:pacienteId/historia — obtener historia clínica (crear si no existe)
router.get("/:pacienteId/historia", async (req, res) => {
  try {
    const { pacienteId } = req.params;
    // Verificar si el paciente existe
    const paciente = await Paciente.findById(pacienteId);
    if (!paciente) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }

    // Buscar historia clínica existente
    let historia = await HistoriaClinica.findOne({ paciente: pacienteId });

    if (!historia) {
      // --- AQUÍ AJUSTAMOS ---
      historia = new HistoriaClinica({
        paciente: pacienteId,                                // campo correcto
        sexo: paciente.sexo,                                 // requerido
        fechaNacimiento: paciente.fechaNacimiento,           // requerido
        identificacion: {                                    // requerido
          tipo: paciente.tipoDocumento,
          numero: paciente.numeroDocumento
        },
        // puedes poner más defaults opcionales si quieres...
      });
      await historia.save();
    }

    // Obtener detalles de los CUPS...
    const cupsCodigos = historia.cups || [];
    const cupsDetalles = await Cup.find({ codigo: { $in: cupsCodigos } }).select("codigo nombre");
    const cupsConNombre = cupsDetalles.map(cup => ({ codigo: cup.codigo, nombre: cup.nombre }));

    // Devolver historia + datosPaciente
    res.json({
      ...historia.toObject(),
      cupsConNombre,
      datosPaciente: {
        nombreCompleto: paciente.nombreCompleto,
        tipoDocumento: paciente.tipoDocumento,
        numeroDocumento: paciente.numeroDocumento,
        sexo: paciente.sexo,
        correo: paciente.correo,
        telefono: paciente.telefono,
        eps: paciente.eps,
      },
    });
  } catch (error) {
    console.error("Error cargando o creando historia clínica:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

module.exports = router;
