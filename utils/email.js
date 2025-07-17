const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function enviarCorreo({ to, subject, html }) {
  const mailOptions = {
    from: '"Soporte ViorClinic" <soporte@viorclinic.es>', 
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { enviarCorreo };