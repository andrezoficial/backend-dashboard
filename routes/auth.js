const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { enviarCorreo } = require("../utils/email");

// === LOGIN ===
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

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ token, usuario: payload });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// === FORGOT PASSWORD ===
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpire = Date.now() + 3600000; // 1 hora
    await user.save();

    const resetUrl = `https://main.d2l6wfab4sd4yu.amplifyapp.com/login${token}`; // Cambia a tu frontend

    const html = `
      <h3>Recuperación de contraseña</h3>
      <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Este enlace expira en 1 hora.</p>
    `;

    await enviarCorreo({
      to: user.email,
      subject: "Restablecer contraseña",
      html,
    });

    res.json({ message: "Correo enviado con instrucciones" });
  } catch (error) {
    console.error("Error en forgot-password:", error);
    res.status(500).json({ message: "Error enviando correo" });
  }
});

// === RESET PASSWORD ===
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { nuevaPassword } = req.body;

  if (!nuevaPassword)
    return res.status(400).json({ message: "La nueva contraseña es obligatoria" });

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Token inválido o expirado" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(nuevaPassword, salt);
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;

    await user.save();
    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error en reset-password:", error);
    res.status(500).json({ message: "Error al cambiar contraseña" });
  }
});

module.exports = router;
