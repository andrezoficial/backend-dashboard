const Configuracion = require("../models/Configuracion");

// Obtener configuración del usuario
exports.obtenerConfiguracion = async (req, res) => {
  try {
    const usuarioId = req.params.usuarioId;
    let config = await Configuracion.findOne({ usuario: usuarioId });

    if (!config) {
      // Si no hay configuración, crear con valores por defecto
      config = new Configuracion({ usuario: usuarioId });
      await config.save();
    }

    res.json(config);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener configuración" });
  }
};

// Actualizar configuración del usuario
exports.actualizarConfiguracion = async (req, res) => {
  try {
    const usuarioId = req.params.usuarioId;
    const { temaOscuro, notificaciones, rolSeleccionado } = req.body;

    let config = await Configuracion.findOneAndUpdate(
      { usuario: usuarioId },
      { temaOscuro, notificaciones, rolSeleccionado },
      { new: true, upsert: true } // crear si no existe
    );

    res.json(config);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar configuración" });
  }
};
