const express = require("express");
const router = express.Router();
const axios = require("axios");

const CLIENT_ID = process.env.ICD_CLIENT_ID;
const CLIENT_SECRET = process.env.ICD_CLIENT_SECRET;

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

// Función para limpiar etiquetas HTML de un string
function limpiarHTML(texto) {
  if (!texto) return "";
  return texto.replace(/<[^>]+>/g, "");
}

// Función para extraer el código final de la URL
function extraerCodigo(url) {
  if (!url) return "sin código";
  const partes = url.split("/");
  return partes[partes.length - 1];
}

router.get("/buscar", async (req, res) => {
  const { termino } = req.query;

  if (!termino || termino.trim().length < 3) {
    return res.status(400).json({ error: "El término de búsqueda debe tener al menos 3 caracteres" });
  }

  try {
    const token = await getICDToken();
    const response = await axios.get(
      `https://id.who.int/icd/release/11/2023-01/mms/search?q=${encodeURIComponent(termino)}&flatResults=true`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "API-Version": "v2",
          "Accept-Language": "es",
        },
      }
    );

    const resultados = response.data?.destinationEntities || [];

    const resultadosLimpios = resultados.map(item => ({
      code: extraerCodigo(item.code || item.id),
      title: limpiarHTML(item.title || item.name || "sin título"),
    }));

    res.json(resultadosLimpios);
  } catch (error) {
    console.error("Error al consultar ICD-11:", error.response?.data || error.message);
    res.status(500).json({ error: "Error al consultar ICD-11" });
  }
});

module.exports = router;
