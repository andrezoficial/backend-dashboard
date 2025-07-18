const express = require("express");
const router = express.Router();
const Cita = require("../models/cita");

const horariosFijos = ["09:00", "11:00", "14:00"];

router.get("/", async (req, res) => {
  try {
    const { fecha } = req.query; // formato 'YYYY-MM-DD'
    if (!fecha) return res.status(400).json({ message: "Fecha requerida" });

    const inicio = new Date(fecha + "T00:00:00.000Z");
    const fin = new Date(fecha + "T23:59:59.999Z");

    const citasDelDia = await Cita.find({
      fecha: { $gte: inicio, $lte: fin },
    });

    const horasOcupadas = citasDelDia.map(cita => cita.fecha.toISOString().substring(11, 16));

    const horariosDisponibles = horariosFijos.filter(hora => !horasOcupadas.includes(hora));

    res.json(horariosDisponibles);
  } catch (error) {
    console.error("Error al obtener horarios:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

module.exports = router;
