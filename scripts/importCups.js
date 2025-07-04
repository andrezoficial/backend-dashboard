require("dotenv").config();
const mongoose = require("mongoose");
const xlsx = require("xlsx");
const Cups = require("../models/Cups");

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error("❌ No se encontró la variable de entorno MONGO_URI");
  process.exit(1);
}

async function importarCups() {
  try {
    console.log("Mongo URI usado:", mongoUri);
    await mongoose.connect(mongoUri);
    console.log("✅ Conectado a MongoDB Atlas");

    const workbook = xlsx.readFile("./data/cups.xlsx");
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);
const filteredData = data.filter(item => item["codigo"] && item["nombre"]);
    const cupsFormatted = filteredData.map(item => ({
  tabla: item["Tabla"] || "",
  codigo: item["codigo"],
  nombre: item["nombre"],
  descripcion: item["descripcion"] || "",
  habilitado: item["habilitado"] === "Sí" || item["habilitado"] === true,
  aplicacion: item["aplicacion"] || "",
  isStandardGEL: item["isStan"] === "Sí" || item["isStan"] === true, // Aquí confirma el nombre exacto
  isStandardMSPS: item["isStan"] === "Sí" || item["isStan"] === true, // Revisa si es otro campo distinto
  extra: {
    usoCodigoCUP: item["usoCodigoCUP"] || "",
    qx: item["qx"] || "",
    nroMinimo: item["nroMinimo"] ? Number(item["nroMinimo"]) : null,
    nroMaximo: item["nroMaximo"] ? Number(item["nroMaximo"]) : null,
    dxRequerido: item["dxRequerido"] || "",
    sexo: item["sexo"] || "",
    ambito: item["ambito"] || "",
    estancia: item["estancia"] || "",
    cobertura: item["cobertura"] || "",
  },
}));

    if (cupsFormatted.length === 0) {
      console.warn("⚠️ No hay datos para insertar");
      return;
    }

    await Cups.deleteMany();
    await Cups.insertMany(cupsFormatted);

    console.log("✅ Datos de CUPS importados correctamente");
  } catch (err) {
    console.error("❌ Error al importar:", err);
  } finally {
    await mongoose.connection.close();
  }
}

importarCups();
