const HistoriaClinica = require("../models/HistoriaClinica");

exports.obtenerHistoriaClinica = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const historia = await HistoriaClinica.findOne({ pacienteId });
    if (!historia) {
      return res.status(404).json({ message: "Historia clínica no encontrada" });
    }
    res.json(historia);
  } catch (error) {
    console.error("Error al obtener historia clínica:", error);
    res.status(500).json({ message: "Error al obtener historia clínica" });
  }
};

exports.guardarHistoriaClinica = async (req, res) => {
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
      historia = new HistoriaClinica({ pacienteId });
    }

    historia.motivoConsulta = motivoConsulta;
    historia.antecedentes = antecedentes;
    historia.examenFisico = examenFisico;
    historia.diagnostico = diagnostico;
    historia.tratamiento = tratamiento;
    historia.recomendaciones = recomendaciones;
    historia.cups = cups;

    await historia.save();

    res.json(historia);
  } catch (error) {
    console.error("Error guardando historia clínica:", error);
    res.status(500).json({ message: "Error guardando historia clínica" });
  }
};
