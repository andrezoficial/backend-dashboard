const mongoose = require("mongoose");

const motivoSchema = new mongoose.Schema({
  value: { type: String, required: true, unique: true },
  label: { type: String, required: true },
}, { timestamps: true });


module.exports = mongoose.model("Motivo", motivoSchema);