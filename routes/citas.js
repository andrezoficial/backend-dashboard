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

module.exports = router;
