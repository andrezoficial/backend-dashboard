const Cita = require('../models/Cita');
const Paciente = require('../models/paciente');
const nodemailer = require('nodemailer');
const { createEvent } = require('ics');
const twilio = require('twilio'); 

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

exports.listarCitas = async (req, res) => {
  try {
    const citas = await Cita.find().populate('paciente');
    res.json(citas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener citas' });
  }
};

exports.crearCita = async (req, res) => {
  const { paciente, fecha, motivo } = req.body;

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

    // Google Calendar link
    const startDateUTC = fechaObj.toISOString().replace(/-|:|\.\d+/g, "");
    const endDateObj = new Date(fechaObj.getTime() + 60 * 60 * 1000);
    const endDateUTC = endDateObj.toISOString().replace(/-|:|\.\d+/g, "");
    const googleCalendarUrl = `https://calendar.google.com/calendar/r/eventedit?text=Cita%20médica&dates=${startDateUTC}/${endDateUTC}&details=${encodeURIComponent(motivo)}&location=Consultorio&trp=true`;

    // ICS file
    const [year, month, day, hour, minute] = [
      fechaObj.getUTCFullYear(),
      fechaObj.getUTCMonth() + 1,
      fechaObj.getUTCDate(),
      fechaObj.getUTCHours(),
      fechaObj.getUTCMinutes(),
    ];

    const { error, value } = createEvent({
      start: [year, month, day, hour, minute],
      duration: { hours: 1 },
      title: 'Cita médica',
      description: motivo,
      location: 'Consultorio',
      status: 'CONFIRMED',
      organizer: { name: 'ViorClinic', email: process.env.EMAIL_USER },
      attendees: [{ name: existePaciente.nombreCompleto, email: existePaciente.correo }],
    });

    if (error) {
      console.error('Error creando archivo ics:', error);
    }

    // Enviar correo
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      to: existePaciente.correo,
      subject: 'Confirmación de cita médica',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #2c3e50;">Confirmación de Cita Médica</h2>
          <p>Hola <strong>${existePaciente.nombreCompleto}</strong>,</p>
          <p>Tu cita médica ha sido agendada con éxito. Aquí tienes los detalles:</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px;"><strong>Fecha y hora:</strong></td><td>${fechaFormateada}</td></tr>
            <tr><td style="padding: 8px;"><strong>Motivo:</strong></td><td>${motivo}</td></tr>
          </table>
          <p>
            <a href="${googleCalendarUrl}" target="_blank" style="display:inline-block;padding:10px 20px;background:#4285F4;color:white;text-decoration:none;border-radius:4px;font-weight:bold;">
              Agregar a Google Calendar
            </a>
          </p>
          <p>Gracias por confiar en nosotros.<br/>Equipo <strong>ViorClinic</strong></p>
        </div>
      `,
      icalEvent: {
        filename: 'cita-medica.ics',
        method: 'REQUEST',
        content: value,
      },
    };

    await transporter.sendMail(mailOptions);

    // WhatsApp
    const mensaje = `👋 Hola ${existePaciente.nombreCompleto},

🗓️ Te confirmamos que tu cita médica ha sido agendada.

📅 *Fecha:* ${fechaObj.toLocaleDateString()}
🕒 *Hora:* ${fechaObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
📋 *Motivo:* ${motivo}

📍 Ubicación: Consultorio ViorClinic
🔗 Si deseas agregarla a tu Google Calendar: ${googleCalendarUrl}

Gracias por confiar en nosotros. 😊`;

    await client.messages.create({
      from: 'whatsapp:+14155238886',
      to: `whatsapp:+57${existePaciente.telefono}`,
      body: mensaje,
    });

    res.status(201).json(nuevaCita);
  } catch (error) {
    console.error('Error al crear cita:', error);
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
