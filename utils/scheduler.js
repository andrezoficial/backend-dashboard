const cron = require('node-cron');
const Cita = require('./models/Cita');
const Paciente = require('./models/paciente');
const { enviarCorreo } = require('./email');

function startRecordatorio24h() {
  // Ejecutar cada hora (puedes cambiar la frecuencia)
  cron.schedule('0 * * * *', async () => {
    console.log('Revisando citas para enviar recordatorio 24 horas antes...');

    try {
      const ahora = new Date();
      const dentroDe24Horas = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);

      // Buscar citas cuya fecha esté entre dentroDe24Horas y dentroDe24Horas + 1 hora (ventana de 1 hora)
      const citas = await Cita.find({
        fecha: {
          $gte: dentroDe24Horas,
          $lt: new Date(dentroDe24Horas.getTime() + 60 * 60 * 1000),
        },
      }).populate('paciente');

      for (const cita of citas) {
        if (!cita.paciente) continue;

        const fechaFormateada = cita.fecha.toLocaleString('es-CO', {
          dateStyle: 'full',
          timeStyle: 'short',
        });

        const html = `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; background-color: #f9f9f9;">
            <div style="background-color: #ffffff; border-radius: 10px; padding: 20px; max-width: 600px; margin: auto; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
              <img src="https://www.viorclinic.es/logo192.png" alt="Logo ViorClinic" style="max-width: 150px; display: block; margin: 0 auto 20px;">
              <h2 style="text-align: center; color: #007bff;">Recordatorio de Cita</h2>
              <p>Hola <strong>${cita.paciente.nombreCompleto}</strong>,</p>
              <p>Te recordamos que tienes una cita programada para:</p>
              <p><strong>📅 Fecha:</strong> ${fechaFormateada}<br>
                 <strong>📝 Motivo:</strong> ${cita.motivo}</p>
              <p>Por favor llega con al menos 10 minutos de anticipación.</p>
              <p>¡Te esperamos!</p>
              <p style="margin-top: 30px;">Equipo ViorClinic</p>
            </div>
          </div>
        `;

        await enviarCorreo({
          to: cita.paciente.correo,
          subject: 'Recordatorio de cita en ViorClinic - Mañana',
          html,
        });

        console.log(`Recordatorio enviado a ${cita.paciente.correo} para cita ${cita._id}`);
      }
    } catch (error) {
      console.error('Error al enviar recordatorios:', error);
    }
  });
}

module.exports = { startRecordatorio24h };
