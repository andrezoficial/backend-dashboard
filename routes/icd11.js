const express = require("express");
const router = express.Router();
const axios = require("axios");

const CLIENT_ID = process.env.ICD_CLIENT_ID;
const CLIENT_SECRET = process.env.ICD_CLIENT_SECRET;

// Obtener token
async function getICDToken() {
  try {
    const response = await axios.post(
      "https://icdaccessmanagement.who.int/connect/token",
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        scope: "icdapi_access",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("Error al obtener token:", error.response?.data || error.message);
    throw new Error("No se pudo obtener token ICD-11");
  }
}

// Ruta para consultar un término
router.get("/buscar", async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: "Falta el parámetro 'query'" });

  try {
    const token = await getICDToken();
    const response = await axios.get(
      `https://id.who.int/icd/release/11/2023-01/mms/search?q=${encodeURIComponent(query)}&flatResults=true`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error al consultar ICD-11:", error.response?.data || error.message);
    res.status(500).json({ error: "Error al consultar ICD-11" });
  }
});

module.exports = router;
