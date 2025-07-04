const express = require("express");
const router = express.Router();
const HistoriaClinica = require("../models/HistoriaClinica");
const Cup = require("../models/Cups");

router.get("/:pacienteId/historia", async (req, res) => {
  try {
    const { pacienteId } = req.params;

    let historia = await HistoriaClinica.findOne({ pacienteId });

    if (!historia) {
      historia = new HistoriaClinica({
        pacienteId,
        motivoConsulta: "",
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

module.exports = router;
