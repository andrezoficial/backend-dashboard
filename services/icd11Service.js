// services/icd11Service.js
const axios = require('axios');

const ICD11_BASE = 'https://id.who.int/icd/release/11/2023-02';
const LANGUAGE   = 'es';

async function buscarICD11(termino) {
  const url = `${ICD11_BASE}/entity/search`;
  const params = { q: termino, language: LANGUAGE };
  const headers = {
    'API-Version': 'v2',
    Accept:        'application/json'
  };

  const response = await axios.get(url, { params, headers });
  // La respuesta contiene { destinationEntities: [...] }
  return response.data.destinationEntities || [];
}

module.exports = { buscarICD11 };
