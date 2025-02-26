const {ObtenerDatos, escribirArchivoJson} = require ('../config/datos')

const TrasladosGet = (req, res) => {
    ObtenerDatos();
    res.json(ObtenerDatos());
}


module.exports = {
    TrasladosGet
}