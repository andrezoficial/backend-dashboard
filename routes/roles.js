const express = require("express");
const router = express.Router();
const Rol = require("../models/Rol");

// Crear un nuevo rol
router.post("/", async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: "Nombre del rol es obligatorio" });
    }

    const nuevoRol = new Rol({ nombre });
    await nuevoRol.save();
    res.status(201).json(nuevoRol);
  } catch (error) {
    console.error("Error al crear rol:", error);  // 👈 AÑADE ESTO
    res.status(500).json({ error: "Error al crear rol" });
  }
  // Listar roles
router.get("/", async (req, res) => {
  try {
    const roles = await Rol.find();
    res.json(roles);
  } catch (error) {
    console.error("Error al obtener roles:", error);
    res.status(500).json({ error: "Error al obtener roles" });
  }
});
});

module.exports = router;
