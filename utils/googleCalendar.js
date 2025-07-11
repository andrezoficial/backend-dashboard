const { google } = require('googleapis');
const dotenv = require('dotenv');
dotenv.config();

const calendar = google.calendar({ version: 'v3' });

const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  null,
  process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  ['https://www.googleapis.com/auth/calendar']
);

async function crearEventoCalendar({ resumen, descripcion, fecha, pacienteCorreo }) {
  const event = {
    summary: resumen,
    description: descripcion,
    start: {
      dateTime: new Date(fecha).toISOString(),
      timeZone: 'America/Bogota',
    },
    end: {
      dateTime: new Date(new Date(fecha).getTime() + 30 * 60000).toISOString(), // 30 minutos
      timeZone: 'America/Bogota',
    },
    attendees: [{ email: pacienteCorreo }],
  };

  await auth.authorize();
  const response = await calendar.events.insert({
    auth,
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    resource: event,
  });

  return response.data;
}

module.exports = { crearEventoCalendar };
