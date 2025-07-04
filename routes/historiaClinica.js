const express = require("express");
const router = express.Router();
const HistoriaClinica = require("../models/HistoriaClinica");

// Obtener o crear historia clínica por pacienteId
router.get("/:pacienteId/historia", async (req, res) => {
  try {
    const { pacienteId } = req.params;
    console.log("🔍 Buscando historia para paciente:", pacienteId);

    let historia = await HistoriaClinica.findOne({ pacienteId });

    // Si no existe, la creamos vacía
    if (!historia) {
      console.log("📭 No se encontró historia, creando nueva vacía...");
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

    res.json(historia);
  } catch (error) {
    console.error("❌ Error cargando o creando historia clínica:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Crear o actualizar historia clínica
router.post("/:pacienteId/historia", async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const datosHistoria = req.body;

    let historia = await HistoriaClinica.findOne({ pacienteId });

    if (historia) {
      // Actualizar
      Object.assign(historia, datosHistoria);
      await historia.save();
    } else {
      // Crear nueva historia
      historia = new HistoriaClinica({ pacienteId, ...datosHistoria });
      await historia.save();
    }

    res.json(historia);
  } catch (error) {
    console.error("❌ Error guardando historia clínica:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

module.exports = router;
