const express = require('express');
const router  = express.Router();
const { buscarICD11 } = require('../services/icd11Service');

router.get('/buscar', async (req, res) => {
  const termino = req.query.termino;
  if (!termino) return res.status(400).json({ error: 'Falta parámetro termino' });

  try {
    const resultados = await buscarICD11(termino);
    // Mapea solo los campos que necesitas
    const opciones = resultados.map(item => ({
      code:  item.theCode,   // el código ICD-11
      title: item.title      // la descripción
    }));
    res.json(opciones);
  } catch {
    res.status(500).json({ error: 'Error al buscar ICD-11' });
  }
});

module.exports = router;
