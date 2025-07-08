const express = require("express");
const router = express.Router();
const HistoriaClinica = require("../models/HistoriaClinica");
const Cup = require("../models/Cups");
const Paciente = require("../models/Paciente");  // Agrega este require

// GET /:pacienteId/historia — obtener historia clínica (crear si no existe)
router.get("/:pacienteId/historia", async (req, res) => {
  try {
    const { pacienteId } = req.params;

    const existePaciente = await Paciente.findById(pacienteId);
    if (!existePaciente) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }

    let historia = await HistoriaClinica.findOne({ pacienteId });

    if (!historia) {
      historia = new HistoriaClinica({
        pacienteId,
        motivoConsulta: "Medicina general",  // <-- acá el valor válido
        antecedentes: "",
        examenFisico: "",
        diagnostico: "",
        tratamiento: "",
        recomendaciones: "",
        cups: [],
      });
      await historia.save();
    }

    // Resto igual...
    const cupsCodigos = historia.cups || [];
    const cupsDetalles = await Cup.find({ codigo: { $in: cupsCodigos } }).select("codigo nombre");
    const cupsConNombre = cupsDetalles.map(cup => ({ codigo: cup.codigo, nombre: cup.nombre }));

    res.json({
      ...historia.toObject(),
      cupsConNombre,
    });
  } catch (error) {
    console.error("Error cargando o creando historia clínica:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});


module.exports = router;
