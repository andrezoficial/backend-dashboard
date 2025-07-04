const mongoose = require('mongoose');

const historiaClinicaSchema = new mongoose.Schema({
  pacienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente', required: true },
  motivoConsulta: String,
  antecedentes: String,
  examenFisico: String,
  diagnostico: String,
  tratamiento: String,
  recomendaciones: String,
  cups: [{ type: String }]  // Array con los códigos CUPS seleccionados
}, { timestamps: true });

module.exports = mongoose.model('HistoriaClinica', historiaClinicaSchema);
