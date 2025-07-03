const mongoose = require("mongoose");
const Cita = require("./models/Cita"); // Ajusta la ruta según tu proyecto
require("dotenv").config(); // si usas variables de entorno

async function limpiarCitas() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const resultado = await Cita.deleteMany({ paciente: null });
    console.log("Citas huérfanas eliminadas:", resultado.deletedCount);
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error limpiando citas:", error);
  }
}

limpiarCitas();
