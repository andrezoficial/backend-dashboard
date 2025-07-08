// routes/historiaClinica.js
const express = require("express");
const router = express.Router();
const HistoriaClinica = require("../models/HistoriaClinica");
const Cup = require("../models/Cups");

// GET /api/pacientes/:pacienteId/historia
// — Solo consulta; devuelve 404 si no existe
router.get("/:pacienteId/historia", async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const historia = await HistoriaClinica.findOne({ pacienteId });

    if (!historia) {
      return res.status(404).json({ message: "Historia clínica no encontrada" });
    }

    // Obtener detalles de CUPS guardados
    const cupsCodigos = historia.cups || [];
    const cupsDetalles = await Cup
      .find({ codigo: { $in: cupsCodigos } })
      .select("codigo nombre")
      .lean();

    const cupsConNombre = cupsDetalles.map(cup => ({
      codigo: cup.codigo,
      nombre: cup.nombre
    }));

    res.json({
      ...historia.toObject(),
      cupsConNombre
    });
  } catch (error) {
    console.error("Error al obtener historia clínica:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// POST /api/pacientes/:pacienteId/historia
// — Crea si no existe, o actualiza si ya existe
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
      cups
    } = req.body;

    if (!motivoConsulta) {
      return res.status(400).json({ message: "Motivo de consulta es obligatorio" });
    }

    let historia = await HistoriaClinica.findOne({ pacienteId });

    if (!historia) {
      // Crear nueva historia
      historia = new HistoriaClinica({
        pacienteId,
        motivoConsulta,
        antecedentes: antecedentes || "",
        examenFisico: examenFisico || "",
        diagnostico: diagnostico || "",
        tratamiento: tratamiento || "",
        recomendaciones: recomendaciones || "",
        cups: Array.isArray(cups) ? cups : []
      });
    } else {
      // Actualizar campos existentes
      historia.motivoConsulta = motivoConsulta;
      historia.antecedentes     = antecedentes;
      historia.examenFisico     = examenFisico;
      historia.diagnostico      = diagnostico;
      historia.tratamiento      = tratamiento;
      historia.recomendaciones  = recomendaciones;
      historia.cups             = Array.isArray(cups) ? cups : [];
    }

    await historia.save();
    res.json(historia);

  } catch (error) {
    console.error("Error al guardar historia clínica:", error);
    res.status(500).json({ message: "Error interno al guardar historia clínica" });
  }
});

module.exports = router;
