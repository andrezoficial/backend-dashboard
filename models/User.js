// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  rol: {
    type: String,
    enum: ["Admin", "Medico", "Auxiliar"],
    default: "Auxiliar",
  },
  password: { type: String, required: true },
  resetToken: String,
  resetTokenExpire: Date,
});

module.exports = mongoose.model("User", userSchema);
