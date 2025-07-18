const axios = require('axios');

const ICD_API_BASE_URL = 'http://localhost:8080'; // tu API ICD-11 corriendo en docker

async function buscarDiagnosticos(termino) {
  try {
    if (!termino) return [];

    // Ejemplo de endpoint ICD-11 para buscar términos (ajusta si cambió la API)
    // Aquí se usa el endpoint swagger: GET /content/mms/search?q={termino}
    const url = `${ICD_API_BASE_URL}/content/mms/search`;

    const response = await axios.get(url, {
      params: { q: termino },
      headers: {
        Accept: 'application/json',
      },
    });

    // La respuesta puede variar según la API, ajusta según el JSON que recibas
    // Por ejemplo, suponemos que response.data.items es un array de diagnósticos
    const items = response.data?.items || [];

    // Mapear para devolver solo lo necesario para frontend
    return items.map((item) => ({
      code: item?.code || item?.id || '',
      label: item?.title || item?.description || 'Sin título',
    }));
  } catch (error) {
    console.error('Error en buscarDiagnosticos ICD:', error.message);
    return [];
  }
}

module.exports = { buscarDiagnosticos };
