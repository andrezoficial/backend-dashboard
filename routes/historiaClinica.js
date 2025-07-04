const express = require('express');
const router = express.Router();
const HistoriaClinica = require('../models/HistoriaClinica');


// Obtener historia clínica por pacienteId
router.get('/:pacienteId/historia', async (req, res) => {
  try {
    const historia = await HistoriaClinica.findOne({ paciente: req.params.pacienteId });
    if (!historia) return res.status(404).json({ message: "Historia clínica no encontrada" });
    res.json(historia);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener la historia clínica" });
  }
});

// Guardar o actualizar historia clínica
router.post('/:pacienteId/historia', async (req, res) => {
  try {
    const { motivoConsulta, antecedentes, examenFisico, diagnostico, tratamiento, recomendaciones, procedimiento } = req.body;

    let historia = await HistoriaClinica.findOne({ paciente: req.params.pacienteId });

    if (historia) {
      // Actualizar
      historia.motivoConsulta = motivoConsulta;
      historia.antecedentes = antecedentes;
      historia.examenFisico = examenFisico;
      historia.diagnostico = diagnostico;
      historia.tratamiento = tratamiento;
      historia.recomendaciones = recomendaciones;
      historia.procedimiento = procedimiento;

      await historia.save();
    } else {
      // Crear nueva
      historia = new HistoriaClinica({
        paciente: req.params.pacienteId,
        motivoConsulta,
        antecedentes,
        examenFisico,
        diagnostico,
        tratamiento,
        recomendaciones,
        procedimiento,
      });
      await historia.save();
    }

    res.json(historia);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al guardar la historia clínica" });
  }
});

module.exports = router;
