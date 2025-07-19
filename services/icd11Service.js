// services/icd11Service.js
const axios = require('axios');
const https = require('https');

const BASE          = 'https://icd.who.int/icdapi';
const LINEARIZATION = 'mms';
const LANGUAGE      = 'es';
const API_VERSION   = 'v2';

// Creamos un agente que desactiva la validación de certificados
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

async function buscarICD11(termino) {
  if (!termino) return [];

  const url = `${BASE}/${LINEARIZATION}/search`;
  const params = { q: termino, language: LANGUAGE };
  const headers = {
    'API-Version': API_VERSION,
    Accept:        'application/json'
  };

  try {
    const { data } = await axios.get(url, {
      params,
      headers,
      httpsAgent    // ← aquí le pasamos el agente
    });
    return data.destinationEntities || [];
  } catch (err) {
    console.error(
      'ICD-11 API error:',
      err.response?.status,
      err.response?.data || err.message
    );
    throw err;
  }
}

module.exports = { buscarICD11 };
