const express = require("express");
const router = express.Router();
const HistoriaClinica = require("../models/HistoriaClinica");
const Cup = require("../models/Cups");

// GET /:pacienteId/historia — obtener historia clínica (crear si no existe)
router.get("/:pacienteId/historia", async (req, res) => {
  try {
    const { pacienteId } = req.params;

    let historia = await HistoriaClinica.findOne({ pacienteId });

    if (!historia) {
      historia = new HistoriaClinica({
        pacienteId,
        motivoConsulta: "",  // Puede quedarse vacío inicialmente
        antecedentes: "",
        examenFisico: "",
        diagnostico: "",
        tratamiento: "",
        recomendaciones: "",
        cups: [],
      });
      await historia.save();
    }

    // Buscar nombres de los cups guardados (diagnósticos/procedimientos)
    const cupsCodigos = historia.cups || [];

    // Buscar en colección de CUPS para obtener nombres
    const cupsDetalles = await Cup.find({ codigo: { $in: cupsCodigos } }).select("codigo nombre");

    // Mapear para devolver sólo código y nombre
    const cupsConNombre = cupsDetalles.map((cup) => ({
      codigo: cup.codigo,
      nombre: cup.nombre,
    }));

    res.json({
      ...historia.toObject(),
      cupsConNombre,
    });
  } catch (error) {
    console.error("Error cargando o creando historia clínica:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// POST /:pacienteId/historia — guardar o actualizar historia clínica
router.post("/:pacienteId/historia", async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const {
      motivoConsulta,
      antecedentes,
      examenFisico,
      diagnostico,
      tratamiento,
      recomendaciones,
      cups,
    } = req.body;

    if (!motivoConsulta) {
      return res.status(400).json({ message: "Motivo de consulta es obligatorio" });
    }

    let historia = await HistoriaClinica.findOne({ pacienteId });

    if (!historia) {
      historia = new HistoriaClinica({ pacienteId });
    }

    historia.motivoConsulta = motivoConsulta;
    historia.antecedentes = antecedentes;
    historia.examenFisico = examenFisico;
    historia.diagnostico = diagnostico;
    historia.tratamiento = tratamiento;
    historia.recomendaciones = recomendaciones;
    historia.cups = cups || [];

    await historia.save();

    res.json(historia);
  } catch (error) {
    console.error("Error guardando historia clínica:", error);
    res.status(500).json({ message: "Error interno al guardar historia clínica" });
  }
});

module.exports = router;
