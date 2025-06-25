const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  rol: {
    type: String, enum: ["Administrador", "Editor", "Lector"], default: "Lector" },
  password: { type: String, required: true },
});

module.exports = mongoose.model("User", userSchema);
