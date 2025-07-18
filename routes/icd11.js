const express = require('express');
const router = express.Router();
const { buscarDiagnosticos } = require('../services/icd11Service');

router.get('/buscar', async (req, res) => {
  const { termino } = req.query;
  if (!termino) {
    return res.status(400).json({ error: 'Falta término de búsqueda' });
  }

  try {
    const resultados = await buscarDiagnosticos(termino);
    res.json(resultados);
  } catch (error) {
    console.error('Error en /api/icd11/buscar:', error);
    res.status(500).json({ error: 'Error al buscar diagnósticos' });
  }
});

module.exports = router;
