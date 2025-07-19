// services/icd11Service.js
const axios       = require('axios');
const { getToken }= require('./authService');

const BASE          = 'https://icd.who.int/icdapi';
const LINEARIZATION = 'mms';
const LANGUAGE      = 'es';
const API_VERSION   = 'v2';

async function buscarICD11(termino) {
  if (!termino) return [];

  const token = await getToken();
  const url   = `${BASE}/${LINEARIZATION}/search`;
  const params = { q: termino, language: LANGUAGE };
  const headers = {
    'API-Version':   API_VERSION,
    'Accept':        'application/json',
    'Authorization': `Bearer ${token}`
  };

  const { data } = await axios.get(url, { params, headers });
  return data.destinationEntities || [];
}

module.exports = { buscarICD11 };
