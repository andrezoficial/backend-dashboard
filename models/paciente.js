const mongoose = require('mongoose');

const pacienteSchema = new mongoose.Schema({
  nombreCompleto: { type: String, required: true },
  tipoDocumento: { type: String, enum: ['cc', 'ti', 'ce'], required: true },
  numeroDocumento: { type: String, required: true, unique: true },
  sexo: { type: String, enum: ['Masculino', 'Femenino', 'Otro'], required: true },
  correo: { type: String, required: true, unique: true },
  telefono: { type: String, required: true },
  eps: { type: String, required: true },
  codigoVerificacion: { type: String, default: null }, // <-- nuevo campo
}, { timestamps: true });

module.exports = mongoose.model('Paciente', pacienteSchema);