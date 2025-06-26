const mongoose = require('mongoose');

const citaSchema = new mongoose.Schema({
  paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente', required: true },
  fecha: { type: Date, required: true },
  motivo: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Cita', citaSchema);
