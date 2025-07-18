const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function enviarCorreo({ to, subject, html, icalEvent }) {
  const mailOptions = {
    from: '"Soporte ViorClinic" <soporte@viorclinic.es>',
    to,
    subject,
    html,
    attachments: icalEvent
      ? [
          {
            filename: icalEvent.filename,
            content: icalEvent.content,
            method: icalEvent.method,
            contentType: "text/calendar",
          },
        ]
      : [],
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { enviarCorreo };
