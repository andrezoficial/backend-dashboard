const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario'); // Asegúrate que el modelo exista

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const usuarios = await Usuario.find(); // Obtener todos los usuarios de MongoDB
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

module.exports = router;
