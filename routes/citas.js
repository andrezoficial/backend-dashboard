const express = require('express');
const router = express.Router();
const citaController = require('../controllers/citaController');

router.get('/', citaController.listarCitas);
router.post('/', citaController.crearCita);
router.delete('/:id', citaController.eliminarCita);

module.exports = router;
