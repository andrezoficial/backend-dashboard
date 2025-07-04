const mongoose = require("mongoose");

const historiaClinicaSchema = new mongoose.Schema({
  pacienteId: { type: mongoose.Schema.Types.ObjectId, ref: "Paciente", required: true, unique: true },
  motivoConsulta: String,
  antecedentes: String,
  examenFisico: String,
  diagnostico: String,
  tratamiento: String,
  recomendaciones: String,
  cups: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model("HistoriaClinica", historiaClinicaSchema);
