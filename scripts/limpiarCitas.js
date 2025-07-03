// scripts/limpiarCitas.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Cita = require('../models/Cita'); // Ajusta la ruta si tu modelo está en otro lugar

dotenv.config();

async function limpiarCitas() {
  try {
    // Conecta a la base de datos usando la URI de tu .env
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Elimina las citas donde paciente es null o no existe
    const resultado = await Cita.deleteMany({ paciente: null });

    console.log(`Citas huérfanas eliminadas: ${resultado.deletedCount}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error limpiando citas:', error);
    process.exit(1);
  }
}

limpiarCitas();
