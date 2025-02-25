const {ObtenerDatos, escribirArchivoJson} = require ('./datos')

const TrasladosGet = (req, res) => {
    ObtenerDatos();
    res.json(ObtenerDatos());
}


module.exports = {
    TrasladosGet
}