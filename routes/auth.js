// routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email y contraseña obligatorios" });

  try {
    const usuario = await User.findOne({ email });
    if (!usuario)
      return res.status(401).json({ error: "Credenciales incorrectas" });

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido)
      return res.status(401).json({ error: "Credenciales incorrectas" });

    const payload = {
      id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token, usuario: payload });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
