// controllers/historiaclinica.js
const HistoriaClinica = require("../models/HistoriaClinica");

exports.obtenerHistoriaClinica = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const historia = await HistoriaClinica.findOne({ paciente: pacienteId });

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
      diagnosticos,
      tratamiento,
      recomendaciones,
      cups,
      sexo,
      fechaNacimiento,
      identificacion,
      estadoCivil,
      ocupacion,
      direccion,
      telefono,
      correo,
      eps,
      contactoEmergencia,
    } = req.body;

    // Validar campos obligatorios mínimos
    if (!motivoConsulta) {
      return res.status(400).json({ message: "Motivo de consulta es obligatorio" });
    }
    if (!sexo || !fechaNacimiento || !identificacion?.tipo || !identificacion?.numero) {
      return res.status(400).json({ message: "Faltan datos obligatorios para la historia clínica" });
    }

    // Buscar historia existente
    let historia = await HistoriaClinica.findOne({ paciente: pacienteId });

    if (!historia) {
      // Crear historia nueva con pacienteId
      historia = new HistoriaClinica({ paciente: pacienteId });
    }

    // Actualizar todos los campos
    historia.motivoConsulta = motivoConsulta;
    historia.antecedentes = antecedentes;
    historia.examenFisico = examenFisico;
    historia.diagnosticos = diagnosticos;
    historia.tratamiento = tratamiento;
    historia.recomendaciones = recomendaciones;
    historia.cups = cups;

    historia.sexo = sexo;
    historia.fechaNacimiento = new Date(fechaNacimiento);
    historia.identificacion = identificacion;
    historia.estadoCivil = estadoCivil;
    historia.ocupacion = ocupacion;
    historia.direccion = direccion;
    historia.telefono = telefono;
    historia.correo = correo;
    historia.eps = eps;
    historia.contactoEmergencia = contactoEmergencia;

    await historia.save();

    res.json(historia);
  } catch (error) {
    console.error("Error guardando historia clínica:", error);
    res.status(500).json({ message: "Error guardando historia clínica" });
  }
};
