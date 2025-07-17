const mongoose = require("mongoose");
require("dotenv").config();

const motivoSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true },
});

const Motivo = mongoose.model("Motivo", motivoSchema);

async function insertarMotivos() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { // <--- aquí el cambio
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const motivos = [
      { label: "Medicina general", value: "medicina-general" },
      { label: "Odontología", value: "odontologia" },
      { label: "Optometría", value: "optometria" },
      { label: "Medicina con especialistas", value: "medicina-especialistas" },
      { label: "Laboratorios", value: "laboratorios" },
    ];

    await Motivo.insertMany(motivos);
    console.log("Motivos insertados correctamente");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al insertar motivos:", error);
    process.exit(1);
  }
}

insertarMotivos();
