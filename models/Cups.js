const mongoose = require("mongoose");

const cupsSchema = new mongoose.Schema(
  {
    tabla: { type: String },
    codigo: { type: String, required: true, unique: true },
    nombre: { type: String, required: true },
    descripcion: { type: String },
    habilitado: { type: Boolean, default: true },
    aplicacion: { type: String },
    isStandardGEL: { type: Boolean, default: false },
    isStandardMSPS: { type: Boolean, default: false },
    extra: {
      usoCodigoCUP: { type: String },
      qx: { type: String },
      nroMinimo: { type: Number },
      nroMaximo: { type: Number },
      dxRequerido: { type: String },
      sexo: { type: String },
      ambito: { type: String },
      estancia: { type: String },
      cobertura: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cups", cupsSchema);
