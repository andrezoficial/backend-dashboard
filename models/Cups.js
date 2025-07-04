const mongoose = require("mongoose");

const cupsSchema = new mongoose.Schema({
  tabla: String,
  codigo: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  descripcion: String,
  habilitado: Boolean,
  aplicacion: String,
  isStandardGEL: Boolean,
  isStandardMSPS: Boolean,
  extra: {
    usoCodigoCUP: String,
    qx: String,
    nroMinimo: Number,
    nroMaximo: Number,
    dxRequerido: String,
    sexo: String,
    ambito: String,
    estancia: String,
    cobertura: String
  }
}, { timestamps: true });

module.exports = mongoose.model("Cups", cupsSchema);
