const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  user: { type: String, required: true }, // ejemplo: "Usuario" o "Bot"
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", messageSchema);