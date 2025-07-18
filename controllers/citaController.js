const Cita = require('../models/Cita');
const Paciente = require('../models/paciente');
const { enviarCorreo } = require('../utils/email');
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
    if (error) console.error('Error creando archivo ics:', error);

    // ✅ Correo con diseño profesional
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; border-radius: 10px; padding: 20px; max-width: 600px; margin: auto; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <img src="https://www.viorclinic.es/logo.png" alt="Logo ViorClinic" style="max-width: 150px; display: block; margin: 0 auto 20px;">
          <h2 style="text-align: center; color: #007bff;">¡Tu cita ha sido confirmada!</h2>
          <p>Hola <strong>${existePaciente.nombreCompleto}</strong>,</p>
          <p>Tu cita en <strong>ViorClinic</strong> ha sido programada correctamente.</p>
          <p><strong>📅 Fecha:</strong> ${fechaFormateada}<br>
             <strong>📝 Motivo:</strong> ${motivo}</p>
          <p>Por favor llega con al menos 10 minutos de anticipación. Si necesitas reprogramar, contáctanos con tiempo.</p>
          <p style="margin-top: 30px;">Gracias por confiar en nosotros,</p>
          <p><strong>Equipo ViorClinic</strong></p>
        </div>
      </div>
    `;

    await enviarCorreo({
      to: existePaciente.correo,
      subject: 'Confirmación de cita en ViorClinic',
      html,
      icalEvent: {
        filename: 'cita-medica.ics',
        method: 'REQUEST',
        content: value,
      },
    });

    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

    if (notificarWhatsApp) {
      const mensajeWhatsApp = `👋 Hola ${existePaciente.nombreCompleto}, tu cita en *ViorClinic* fue agendada para *${fechaFormateada}*. 🩺 Motivo: ${motivo}. ¡Te esperamos!`;

      await client.messages.create({
        body: mensajeWhatsApp,
        from: 'whatsapp:+14155238886',
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
