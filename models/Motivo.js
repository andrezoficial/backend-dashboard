const mongoose = require('mongoose');

const motivoSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true, unique: true },
}, { timestamps: true });

module.exports = mongoose.model('Motivo', motivoSchema);
