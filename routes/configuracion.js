const express = require("express");
const router = express.Router();
const configuracionController = require("../controllers/configuracionController");

// Obtener configuración de un usuario
router.get("/:usuarioId", configuracionController.obtenerConfiguracion);

// Guardar o actualizar configuración de un usuario
router.post("/:usuarioId", configuracionController.actualizarConfiguracion);

module.exports = router;