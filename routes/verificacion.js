const express = require("express");
const router = express.Router();
const Paciente = require("./models/paciente");
const CodigoVerificacion = require("./models/CodigoVerificacion");
const { enviarCorreo } = require("../utils/email");

// Enviar código al correo si está registrado
router.post("/enviar-codigo", async (req, res) => {
  try {
    const correo = (req.body.correo || "").trim().toLowerCase();
    if (!correo) return res.status(400).json({ message: "Correo obligatorio" });

    const paciente = await Paciente.findOne({ correo: new RegExp(`^${correo}$`, 'i') });
    if (!paciente) return res.status(404).json({ message: "No encontramos ese correo en nuestros registros. Verifica e intenta de nuevo." });

    // Eliminar códigos previos para ese correo
    await CodigoVerificacion.deleteMany({ correo });

    // Generar código aleatorio de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    // Guardar código en BD (expira en 10 minutos)
    await CodigoVerificacion.create({ correo, codigo });

    // Enviar correo
    await enviarCorreo({
      to: correo,
      subject: "Código de verificación para agendar cita - Vior Clinic",
      html: `<p>Hola ${paciente.nombreCompleto},</p>
             <p>Tu código de verificación es: <b>${codigo}</b></p>
             <p>Este código expirará en 10 minutos.</p>`,
    });

    return res.json({ message: "Código enviado correctamente a tu correo." });
  } catch (error) {
    console.error("Error en /enviar-codigo:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
});

// Validar código ingresado
router.post("/validar-codigo", async (req, res) => {
  try {
    const correo = (req.body.correo || "").trim().toLowerCase();
    const codigoIngresado = (req.body.codigo || "").trim();

    if (!correo || !codigoIngresado) {
      return res.status(400).json({ message: "Correo y código son obligatorios." });
    }

    const registro = await CodigoVerificacion.findOne({ correo: new RegExp(`^${correo}$`, 'i') });
    if (!registro) {
      return res.status(404).json({ message: "Código no encontrado o expirado. Solicita un nuevo código." });
    }

    if (registro.intentos >= 5) {
      await CodigoVerificacion.deleteOne({ correo });
      return res.status(403).json({ message: "Número máximo de intentos excedido. Solicita un nuevo código." });
    }

    if (registro.codigo !== codigoIngresado) {
      registro.intentos += 1;
      await registro.save();
      return res.status(401).json({ message: "Código incorrecto. Intenta nuevamente." });
    }

    // Código correcto: eliminar registro para no reutilizar
    await CodigoVerificacion.deleteOne({ correo });

    const paciente = await Paciente.findOne({ correo: new RegExp(`^${correo}$`, 'i') });
    if (!paciente) return res.status(404).json({ message: "Paciente no encontrado." });

    return res.json({ message: "Código validado correctamente.", paciente });
  } catch (error) {
    console.error("Error en /validar-codigo:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
});

module.exports = router;
