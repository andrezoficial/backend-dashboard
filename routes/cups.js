const express = require("express");
const router = express.Router();
const Cups = require("../models/Cups");

// GET /api/cups?q=texto — Buscar CUPS por código o nombre (limit 20)
router.get("/", async (req, res) => {
  const query = req.query.q || "";
  try {
    const cups = await Cups.find(
      {
        $or: [
          { codigo: { $regex: query, $options: "i" } },
          { nombre: { $regex: query, $options: "i" } }
        ]
      },
      "codigo nombre"
    )
      .limit(20)
      .lean();

    console.log("👉 Cups encontrados:", cups); // debug temporal

    const options = cups.map(cup => ({
      value: cup.codigo,
      label: `${cup.codigo} - ${cup.nombre}`
    }));

    res.json(options);
  } catch (err) {
    console.error("Error al buscar CUPS:", err);
    res.status(500).json({ message: "Error al buscar CUPS" });
  }
});

// GET /api/cups/:codigo — Obtener detalles completos de un CUPS por código
router.get("/:codigo", async (req, res) => {
  const codigo = req.params.codigo.toUpperCase();
  try {
    const cup = await Cups.findOne({ codigo });
    if (!cup) return res.status(404).json({ message: "CUPS no encontrado" });
    res.json(cup);
  } catch (err) {
    console.error("Error al obtener CUPS:", err);
    res.status(500).json({ message: "Error al obtener CUPS" });
  }
});

module.exports = router;
