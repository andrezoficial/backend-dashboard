const express = require("express");
const router = express.Router();
const Motivo = require("../models/Motivo");

router.get("/", async (req, res) => {
  try {
    const motivos = await Motivo.find({});

    const motivosFormateados = motivos.map(m => ({
      value: m.value.toLowerCase(),
      label: m.label
    }));

    res.json(motivosFormateados);
  } catch (error) {
    console.error("Error al obtener motivos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

module.exports = router;
