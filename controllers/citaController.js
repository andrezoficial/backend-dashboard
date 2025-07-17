const Cita = require('../models/Cita');
const Paciente = require('../models/paciente');
const { enviarCorreo } = require('../utils/email'); // Importa la función enviarCorreo centralizada
const { createEvent } = require('ics');
const twilio = require('twilio');

exports.listarCitas = async (req, res) => {
  try {
    const citas = await Cita.find().populate('paciente');
    res.json(citas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener citas' });
  }
};

exports.crearCita = async (req, res) => {
  const { paciente, fecha, motivo, notificarWhatsApp = true, notificarSMS = true } = req.body;

  if (!paciente || !fecha || !motivo) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const existePaciente = await Paciente.findById(paciente);
    if (!existePaciente) {
      return res.status(400).json({ error: 'Paciente no existe' });
    }

    const nuevaCita = new Cita({ paciente, fecha, motivo });
    await nuevaCita.save();

    const fechaObj = new Date(fecha);
    const fechaFormateada = fechaObj.toLocaleString('es-CO', {
      dateStyle: 'full',
      timeStyle: 'short',
    });

    const event = {
      start: [
        fechaObj.getUTCFullYear(),
        fechaObj.getUTCMonth() + 1,
        fechaObj.getUTCDate(),
        fechaObj.getUTCHours(),
        fechaObj.getUTCMinutes(),
      ],
      duration: { hours: 1 },
      title: 'Cita médica',
      description: motivo,
      location: 'Consultorio',
      status: 'CONFIRMED',
      organizer: { name: 'ViorClinic', email: process.env.EMAIL_USER },
      attendees: [{ name: existePaciente.nombreCompleto, email: existePaciente.correo }],
    };

    const { error, value } = createEvent(event);
    if (error) {
      console.error('Error creando archivo ics:', error);
    }

    // Usar enviarCorreo para enviar el email con Brevo SMTP
    await enviarCorreo({
      to: existePaciente.correo,
      subject: 'Confirmación de cita médica',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #2c3e50;">Confirmación de Cita Médica</h2>
          <p>Hola <strong>${existePaciente.nombreCompleto}</strong>,</p>
          <p>Tu cita médica ha sido agendada con éxito. Aquí tienes los detalles:</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ccc;"><strong>Fecha y hora:</strong></td>
              <td style="padding: 8px; border: 1px solid #ccc;">${fechaFormateada}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ccc;"><strong>Motivo:</strong></td>
              <td style="padding: 8px; border: 1px solid #ccc;">${motivo}</td>
            </tr>
          </table>
          <p>Gracias por confiar en nosotros.</p>
          <p>Saludos,<br/><strong>Tu equipo ViorClinic</strong></p>
        </div>
      `,
      icalEvent: {
        filename: 'cita-medica.ics',
        method: 'REQUEST',
        content: value,
      },
    });

    // Configurar cliente Twilio para WhatsApp y SMS
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

    if (notificarWhatsApp) {
      const mensajeWhatsApp = `👋 Hola ${existePaciente.nombreCompleto}, tu cita en *ViorClinic* fue agendada para *${fechaFormateada}*. 🩺 Motivo: ${motivo}. ¡Te esperamos!`;

      await client.messages.create({
        body: mensajeWhatsApp,
        from: 'whatsapp:+14155238886', // Twilio sandbox para WhatsApp
        to: `whatsapp:+57${existePaciente.telefono}`,
      });
    }

    if (notificarSMS) {
      const mensajeSMS = `Hola ${existePaciente.nombreCompleto}, tu cita en ViorClinic fue agendada para ${fechaFormateada}. Motivo: ${motivo}.`;

      await client.messages.create({
        body: mensajeSMS,
        from: process.env.TWILIO_PHONE,
        to: `+57${existePaciente.telefono}`,
      });
    }

    res.status(201).json(nuevaCita);
  } catch (error) {
    console.error('Error al crear cita o enviar notificaciones:', error);
    res.status(500).json({ error: 'Error al crear cita o enviar notificaciones' });
  }
};

exports.eliminarCita = async (req, res) => {
  try {
    await Cita.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar cita' });
  }
};
