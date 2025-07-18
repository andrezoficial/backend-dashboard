const mongoose = require("mongoose");

const historiaClinicaSchema = new mongoose.Schema(
  {
    pacienteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Paciente",
      required: true,
      unique: true,
    },
    motivoConsulta: {
      type: String,
      enum: [
        "Medicina general",
        "Odontología",
        "Optometría",
        "Medicina con especialistas",
        "Laboratorios",
      ],
      required: true,
      default: "Medicina general",
    },
    antecedentes: String,
    examenFisico: String,
    codigoDiagnostico: String,
    nombreDiagnostico: String,
    tratamiento: String,
    recomendaciones: String,
    cups: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("HistoriaClinica", historiaClinicaSchema);
