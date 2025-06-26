const mongoose = require("mongoose");

const configuracionSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  temaOscuro: { type: Boolean, default: false },
  notificaciones: { type: Boolean, default: true },
  rolSeleccionado: { type: String, enum: ["Admin", "Editor", "Viewer"], default: "Viewer" }
}, { timestamps: true });

module.exports = mongoose.model("Configuracion", configuracionSchema);
