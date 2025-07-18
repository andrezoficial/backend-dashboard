// routes/icd11.js
const express = require('express');
const { buscarICD11 } = require('../services/icd11Service');
const router = express.Router();

router.get('/buscar', async (req, res) => {
  const termino = req.query.termino;
  if (!termino) {
    return res.status(400).json({ error: 'Falta el parámetro "termino"' });
  }

  try {
    const entidades = await buscarICD11(termino);
    // Mapear solo los campos que necesita el frontend
    const opciones = entidades.map(e => ({
      code:  e.theCode,
      title: e.title
    }));
    res.json(opciones);
  } catch (err) {
    console.error('Error al consultar ICD-11:', err);
    res.status(500).json({ error: 'Error al consultar ICD-11' });
  }
});

module.exports = router;
