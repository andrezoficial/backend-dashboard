const express = require("express");
const router = express.Router();
const Cita = require("../models/Cita");

const horariosFijos = ["09:00", "11:00", "14:00"];

router.get("/", async (req, res) => {
  try {
    const { fecha } = req.query; // esperamos formato 'YYYY-MM-DD'
    if (!fecha) return res.status(400).json({ message: "Fecha requerida" });

    // Buscar citas en esa fecha (sin importar hora)
    // Extraemos la fecha de la cita para comparar solo día-mes-año
    const inicio = new Date(fecha + "T00:00:00.000Z");
    const fin = new Date(fecha + "T23:59:59.999Z");

    const citasDelDia = await Cita.find({
      fecha: { $gte: inicio, $lte: fin },
    });

    // Obtener horas ocupadas de las citas
    const horasOcupadas = citasDelDia.map((cita) => {
      const h = cita.fecha.toISOString().substring(11, 16);
      return h;
    });

    // Filtrar horarios fijos quitando ocupados
    const horariosDisponibles = horariosFijos.filter(
      (hora) => !horasOcupadas.includes(hora)
    );

    res.json(horariosDisponibles);
  } catch (error) {
    console.error("Error al obtener horarios:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

module.exports = router;
