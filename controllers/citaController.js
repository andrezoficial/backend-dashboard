const Cita = require('../models/Cita');
const Paciente = require('../models/paciente');
const nodemailer = require('nodemailer');
const ics = require('ics'); // Necesitas instalar con: npm install ics

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
    // Verificar que el paciente exista
    const existePaciente = await Paciente.findById(paciente);
    if (!existePaciente) {
      return res.status(400).json({ error: 'Paciente no existe' });
    }

    const nuevaCita = new Cita({ paciente, fecha, motivo });
    await nuevaCita.save();

    // Preparar transporter
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Formatear fecha para mostrar en correo (ejemplo en español local)
    const fechaObj = new Date(fecha);
    const fechaFormateada = fechaObj.toLocaleString('es-CO', {
      dateStyle: 'full',
      timeStyle: 'short',
    });

    // Preparar fechas en formato para Google Calendar (UTC y sin separadores)
    const startDateUTC = fechaObj.toISOString().replace(/-|:|\.\d+/g, "");
    const endDateObj = new Date(fechaObj.getTime() + 60 * 60 * 1000); // +1 hora
    const endDateUTC = endDateObj.toISOString().replace(/-|:|\.\d+/g, "");

    const googleCalendarUrl = `https://calendar.google.com/calendar/r/eventedit?text=Cita%20médica&dates=${startDateUTC}/${endDateUTC}&details=${encodeURIComponent(motivo)}&location=Consultorio&trp=true`;

    // Crear evento .ics con la librería ics
    const [year, month, day, hour, minute] = [
      fechaObj.getUTCFullYear(),
      fechaObj.getUTCMonth() + 1,
      fechaObj.getUTCDate(),
      fechaObj.getUTCHours(),
      fechaObj.getUTCMinutes(),
    ];

    // Evento de 1 hora
    const duration = { hours: 1, minutes: 0 };

    const event = {
      start: [year, month, day, hour, minute],
      duration,
      title: 'Cita médica',
      description: motivo,
      location: 'Consultorio',
      status: 'CONFIRMED',
      organizer: { name: 'Tu Clínica', email: process.env.EMAIL_USER },
      attendees: [{ name: existePaciente.nombreCompleto, email: existePaciente.correo, rsvp: true }],
    };

    const { error, value } = ics.createEvent(event);
    if (error) {
      console.error('Error creando archivo ics:', error);
      return res.status(500).json({ error: 'Error generando archivo de calendario' });
    }

    // Opciones mail con HTML y adjunto .ics
    const mailOptions = {
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
          <p>
            <a href="${googleCalendarUrl}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #4285F4; color: white; border-radius: 4px; text-decoration: none; font-weight: bold;">
              Agregar a Google Calendar
            </a>
          </p>
          <p>Gracias por confiar en nosotros.</p>
          <p>Saludos,<br/><strong>Tu equipo médico</strong></p>
        </div>
      `,
      // Adjuntar archivo .ics en formato Buffer
      icalEvent: {
        filename: 'cita-medica.ics',
        method: 'REQUEST',
        content: value,
      },
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json(nuevaCita);
  } catch (error) {
    console.error('Error al crear cita o enviar correo:', error);
    res.status(500).json({ error: 'Error al crear cita o enviar correo' });
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
