const express = require('express');
const ControllerTraslado = require('../controllers/ControllerTraslado');

const router = express.Router();

router.get('/', ControllerTraslado.TrasladosGet)


module.exports = router;