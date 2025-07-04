const mongoose = require("mongoose");
const xlsx = require("xlsx");
const Cups = require("../models/Cups");

// Conectar a MongoDB sin opciones obsoletas
mongoose.connect("mongodb://localhost:27017/tu_basededatos")
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => console.error("❌ Error de conexión:", err));

// Leer archivo Excel (recomendado: archivo .xlsx, no .csv)
const workbook = xlsx.readFile("./data/cups.xlsx"); // Cambia a .xlsx
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet);

(async () => {
  try {
    await Cups.deleteMany(); // Limpia colección
    await Cups.insertMany(data);
    console.log("✅ Datos de CUPS importados correctamente");
  } catch (err) {
    console.error("❌ Error al importar:", err);
  } finally {
    mongoose.connection.close();
  }
})();
