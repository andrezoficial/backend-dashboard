// services/icd11.js
const axios = require('axios');

const clientId = '331d4308-55e5-4c7a-93fd-35952119c167_0c68e126-7607-4bb8-850f-4be05220bd72';
const clientSecret = 'ArgzF9ftUqW7S0kzL91XIQE0tfBFs/DWoizXDgVii58=';

// Obtener access_token de la OMS
async function getToken() {
  const params = new URLSearchParams();
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('scope', 'icdapi_access');
  params.append('grant_type', 'client_credentials');

  try {
    const res = await axios.post('https://icdaccessmanagement.who.int/connect/token', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return res.data.access_token;
  } catch (error) {
    console.error('Error al obtener el token ICD:', error.message);
    throw error;
  }
}

// Buscar por palabra clave
async function buscarICD11(palabraClave) {
  const token = await getToken();

  const url = `https://id.who.int/icd/release/11/2024-01/mms/search?q=${encodeURIComponent(palabraClave)}&flatResults=true`;

  try {
    const res = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      }
    });

    return res.data;
  } catch (error) {
    console.error('ICD-11 API error:', error.message);
    throw error;
  }
}

module.exports = { buscarICD11 };
