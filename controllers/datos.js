const fs = require('fs');
const path = require('path');

const rutaArchivo = path.join(__dirname, '../data/data.json');

const ObtenerDatos = () =>{
    const data = fs.readFileSync(rutaArchivo, 'utf-8');
    return JSON.parse(data);     
};

function escribirArchivoJson(datos) {
    return new Promise((resolve, reject) => {
      fs.writeFile(rutaArchivo, JSON.stringify(datos, null, 2), 'utf8', (err) => {
        if (err) {
          reject(err); // Rechazar la promesa si hay un error
        } else {
          resolve(); // Resolver la promesa si la escritura fue exitosa
        }
      });
    });
};

module.exports = {ObtenerDatos, escribirArchivoJson}