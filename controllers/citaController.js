const Cita = require('../models/Cita');
const Paciente = require('../models/paciente'); // Importa el modelo Paciente

exports.listarCitas = async (req, res) => {
  try {
    const citas = await Cita.find().populate('paciente');
    res.json(citas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener citas' });
  }
};

exports.crearCita = async (req, res) => {
  const { paciente, fecha, motivo } = req.body;

  if (!paciente || !fecha || !motivo) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    // Verificar que el paciente exista
    const existePaciente = await Paciente.findById(paciente);
    if (!existePaciente) {
      return res.status(400).json({ error: 'Paciente no existe' });
    }

    const nuevaCita = new Cita({ paciente, fecha, motivo });
    await nuevaCita.save();
    res.status(201).json(nuevaCita);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear cita' });
  }
};

exports.eliminarCita = async (req, res) => {
  try {
    await Cita.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar cita' });
  }
};
