module.exports = (nombre, enlace) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2 style="color: #2D89EF;">Recuperación de Contraseña</h2>
    <p>Hola ${nombre},</p>
    <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente botón:</p>
    <p>
      <a href="${enlace}" style="display:inline-block; padding:10px 20px; background-color:#2D89EF; color:#fff; text-decoration:none; border-radius:5px;">Restablecer Contraseña</a>
    </p>
    <p>Si no solicitaste esto, puedes ignorar este mensaje.</p>
    <hr />
    <p style="font-size: 12px; color: #888;">ViorClinic · www.viorclinic.es</p>
  </div>
`;
