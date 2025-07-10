const mongoose = require("mongoose");

const codigoVerificacionSchema = new mongoose.Schema({
  correo: { type: String, required: true, lowercase: true, trim: true },
  codigo: { type: String, required: true },
  creadoEn: { type: Date, default: Date.now, expires: 600 }, // 10 min
  intentos: { type: Number, default: 0 }
});

module.exports = mongoose.model("CodigoVerificacion", codigoVerificacionSchema);