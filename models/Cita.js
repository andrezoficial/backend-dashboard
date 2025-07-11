const mongoose = require('mongoose');

const citaSchema = new mongoose.Schema({
  paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente', required: true },
  fecha: { type: Date, required: true },
  motivo: { type: String, required: true },
  estado: { type: String, enum: ['pendiente', 'reprogramada', 'cancelada'], default: 'pendiente' }
}, { timestamps: true });

module.exports = mongoose.model('Cita', citaSchema);
