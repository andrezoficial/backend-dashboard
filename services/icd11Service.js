const axios = require('axios');

const ICD11_BASE = 'http://localhost:8080';      // Tu contenedor Docker
const RELEASE_ID  = '2025-01';                  // Versión aprobada por MSPS

async function buscarICD11(termino) {
  if (!termino) return [];

  try {
    const { data } = await axios.get(
      `${ICD11_BASE}/icd/entity/search`,
      {
        params: {
          q: termino,
          releaseId: RELEASE_ID
        },
        headers: {
          'API-Version': 'v2',
          'Accept':      'application/json'
        }
      }
    );
    // data.destinationEntities es el array de resultados
    return data.destinationEntities || [];
  } catch (error) {
    console.error('ICD-11 API error:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = { buscarICD11 };
