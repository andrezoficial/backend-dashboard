// services/icd11Service.js
const axios = require('axios');
const https = require('https');

const BASE_URL      = 'https://icd.who.int';
const RELEASE       = '11';
const VERSION       = '2025-01';
const LINEARIZATION = 'mms';
const LANGUAGE      = 'es';
const API_VERSION   = 'v2';

// Desactiva validación SSL sólo en desarrollo
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function buscarICD11(termino) {
  if (!termino) return [];

  const url = `${BASE_URL}/icd/release/${RELEASE}/${VERSION}/${LINEARIZATION}/search`;
  const params = { q: termino, language: LANGUAGE };
  const headers = {
    'API-Version': API_VERSION,
    Accept:        'application/json'
  };

  const { data } = await axios.get(url, {
    params,
    headers,
    httpsAgent
  });

  return data.destinationEntities || [];
}

module.exports = { buscarICD11 };
