module.exports = ({ nombre, fecha, hora, motivo }) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2 style="color: #2D89EF;">Cita Confirmada</h2>
    <p>Hola ${nombre},</p>
    <p>Tu cita ha sido programada con éxito:</p>
    <ul>
      <li><strong>Fecha:</strong> ${fecha}</li>
      <li><strong>Hora:</strong> ${hora}</li>
      <li><strong>Motivo:</strong> ${motivo}</li>
    </ul>
    <p>Te esperamos puntual. Si necesitas reprogramar, puedes hacerlo desde tu cuenta.</p>
    <hr />
    <p style="font-size: 12px; color: #888;">ViorClinic · www.viorclinic.es</p>
  </div>
`;
