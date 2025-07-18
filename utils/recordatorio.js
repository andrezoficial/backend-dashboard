const { enviarCorreo } = require("./email");

function agendarRecordatorio(paciente, cita) {
  const tiempoRestante = new Date(cita.fecha).getTime() - Date.now();
  const tiempoAntes = 24 * 60 * 60 * 1000; // 24 horas

  const delay = tiempoRestante - tiempoAntes;

  if (delay <= 0) return; // Ya pasó

  setTimeout(async () => {
    try {
      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Recordatorio de cita</h2>
          <p>Hola <strong>${paciente.nombreCompleto}</strong>,</p>
          <p>Este es un recordatorio de que tienes una cita programada en <strong>ViorClinic</strong>.</p>
          <p><strong>📅 Fecha:</strong> ${new Date(cita.fecha).toLocaleString("es-CO", {
            dateStyle: "full",
            timeStyle: "short",
          })}</p>
          <p>Te esperamos puntual. Si necesitas reprogramar, contáctanos con tiempo.</p>
        </div>
      `;
      await enviarCorreo({
        to: paciente.correo,
        subject: "Recordatorio: Tu cita en ViorClinic es mañana",
        html,
      });
    } catch (error) {
      console.error("Error enviando recordatorio:", error);
    }
  }, delay);
}

module.exports = { agendarRecordatorio };
