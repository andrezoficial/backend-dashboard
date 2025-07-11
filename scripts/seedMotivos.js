// scripts/seedMotivos.js
const mongoose = require("mongoose");
const Motivo = require("../models/Motivo");

const motivos = [
  { value: "medicina_general", label: "Medicina General" },
  { value: "odontologia", label: "Odontología" },
  { value: "optometria", label: "Optometría" },
  { value: "medicina_especialistas", label: "Medicina con Especialistas" },
  { value: "laboratorios", label: "Laboratorios" },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  await Motivo.deleteMany({});
  await Motivo.insertMany(motivos);
  console.log("Motivos insertados correctamente");
  mongoose.disconnect();
}

seed();
