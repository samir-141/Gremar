const express = require('express');
const studentController = require('../controllers/ControllerStudent');

const router = express.Router();

router.get('/', studentController.StudensGet);
router.get('/generar-excel', studentController.ExportarExcel);
router.post('/agregar', studentController.AddEstudiante);
router.get('/buscar', studentController.FiltrarPorNombre);
router.post('/editar/:id', studentController.EditarEstudiante);
module.exports = router;