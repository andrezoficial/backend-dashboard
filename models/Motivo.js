const mongoose = require("mongoose");

const motivoSchema = new mongoose.Schema({
  value: { type: String, required: true, unique: true }, // ej: 'medicina_general'
  label: { type: String, required: true }, // ej: 'Medicina General'
});

module.exports = mongoose.model("Motivo", motivoSchema);