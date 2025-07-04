require("dotenv").config();
const mongoose = require("mongoose");
const xlsx = require("xlsx");
const Cups = require("../models/Cups");

// Conexión a MongoDB desde variable de entorno
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/tu_basededatos";
mongoose.connect(mongoUri)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => console.error("❌ Error de conexión:", err));

// Leer archivo Excel
const workbook = xlsx.readFile("./data/cups.xlsx");
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet);

// Filtrar filas válidas con codigo y nombre
const filteredData = data.filter(item => item.codigo && item.nombre);

(async () => {
  try {
    await Cups.deleteMany(); // Opcional: limpia colección
    await Cups.insertMany(filteredData);
    console.log("✅ Datos de CUPS importados correctamente");
  } catch (err) {
    console.error("❌ Error al importar:", err);
  } finally {
    mongoose.connection.close();
  }
})();
