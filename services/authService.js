// services/authService.js
const axios = require('axios');
const qs    = require('qs');

const TOKEN_URL    = 'https://icd.who.int/icd-api/oauth2/token';  
const CLIENT_ID    = '331d4308-55e5-4c7a-93fd-35952119c167_0c68e126-7607-4bb8-850f-4be05220bd72';
const CLIENT_SECRET= 'ArgzF9ftUqW7S0kzL91XIQE0tfBFs/DWoizXDgVii58=';

// Caché sencillo en memoria
let cached = { token: null, expiresAt: 0 };

async function getToken() {
  const now = Date.now();
  if (cached.token && now < cached.expiresAt) {
    return cached.token;
  }

  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const data = qs.stringify({ grant_type: 'client_credentials' });

  const res = await axios.post(TOKEN_URL, data, {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type':  'application/x-www-form-urlencoded'
    }
  });

  const { access_token, expires_in } = res.data;
  cached.token     = access_token;
  cached.expiresAt = now + (expires_in - 60) * 1000; // renovar 1m antes
  return access_token;
}

module.exports = { getToken };
