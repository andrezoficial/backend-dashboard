const mongoose = require('mongoose');

const pacienteSchema = new mongoose.Schema({
  nombreCompleto: { type: String, required: true },
  tipoDocumento: { type: String, enum: ['cc', 'ti', 'ce'], required: true },
  numeroDocumento: { type: String, required: true, unique: true },
  sexo: { type: String, enum: ['Masculino', 'Femenino', 'Otro'], required: true },
  correo: { type: String, required: true, unique: true },
  telefono: { type: String, required: true },
  eps: { type: String, required: true },

  fechaNacimiento: { type: Date, required: true },
  direccion: { type: String, default: "" },
  estadoCivil: { type: String, enum: ['Soltero(a)', 'Casado(a)', 'Unión libre', 'Divorciado(a)', 'Viudo(a)'], default: 'Soltero(a)' },
  ocupacion: { type: String, default: "" },
  contactoEmergenciaNombre: { type: String, default: "" },
  contactoEmergenciaTelefono: { type: String, default: "" },

  codigoVerificacion: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Paciente', pacienteSchema);
