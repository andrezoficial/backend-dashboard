const express = require("express");
const router = express.Router();
const Cita = require("../models/Cita");
const Motivo = require("../models/Motivo");

// 🗓 Crear una cita
router.post("/", async (req, res) => {
  try {
    const { paciente, motivo, fecha } = req.body;

    const nuevaCita = new Cita({ paciente, motivo, fecha });
    await nuevaCita.save();

    res.status(201).json({ message: "Cita registrada correctamente", cita: nuevaCita });
  } catch (error) {
    console.error("Error al guardar cita:", error);
    res.status(500).json({ message: "Error al registrar cita" });
  }
});

// ❌ Cancelar una cita
router.put("/:id/cancelar", async (req, res) => {
  try {
    const cita = await Cita.findByIdAndUpdate(
      req.params.id,
      { estado: "cancelada" },
      { new: true }
    );

    if (!cita) return res.status(404).json({ message: "Cita no encontrada" });

    res.json({ message: "Cita cancelada", cita });
  } catch (error) {
    console.error("Error al cancelar cita:", error);
    res.status(500).json({ message: "Error al cancelar cita" });
  }
});

// 🔍 Obtener todas las citas (opcional)
router.get("/", async (req, res) => {
  try {
    const citas = await Cita.find().populate("paciente", "nombre documento").sort({ fecha: 1 });
    res.json(citas);
  } catch (error) {
    console.error("Error al obtener citas:", error);
    res.status(500).json({ message: "Error al obtener citas" });
  }
});

// 📋 Obtener motivos (si no los consumes desde otro endpoint)
router.get("/motivos", async (req, res) => {
  try {
    const motivos = await Motivo.find().sort({ label: 1 });
    res.json(motivos);
  } catch (error) {
    console.error("Error al obtener motivos:", error);
    res.status(500).json({ message: "Error al obtener motivos" });
  }
});

module.exports = router;
