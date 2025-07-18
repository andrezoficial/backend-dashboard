// services/icd11Service.js
const axios = require('axios');

// API pública WHO ICD‑11 v2
const ICD11_BASE    = 'https://id.who.int/icd/release/11/2023-02';
const LANGUAGE      = 'es';
const API_VERSION   = 'v2';

async function buscarICD11(termino) {
  if (!termino) return [];

  try {
    const res = await axios.get(
      `${ICD11_BASE}/content/mms/search`,
      {
        params: { q: termino, language: LANGUAGE },
        headers: {
          'API-Version': API_VERSION,
          Accept:        'application/json'
        }
      }
    );
    // res.data.destinationEntities es el array de resultados
    return res.data.destinationEntities || [];
  } catch (err) {
    console.error('ICD-11 API error:', err.response?.status, err.response?.data || err.message);
    throw err;
  }
}

module.exports = { buscarICD11 };
