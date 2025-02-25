const express = require('express');
const cors = require('cors');
const path = require('path'); // Importa path para manejar rutas
const RouterStudent = require('./router/RouterStudent');
const RouterTraladados = require('./router/RouterTrasladados')
const app = express(); // Usa const para evitar variables globales
const port = process.env.PORT || 5000; // Usa un puerto dinámico para compatibilidad

// Middleware
app.use(cors());
app.use(express.json());

// Usa RouterStudent correctamente
app.use('/student', RouterStudent);
app.use('/traslado', RouterTraladados);



// Servir la aplicación React en producción
if (process.env.NODE_ENV === 'production') {
  // Sirve los archivos estáticos de React
  app.use(express.static(path.join(__dirname, '../../frontend/build')));

  // Maneja todas las demás rutas redirigiendo al archivo index.html de React
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
  });
}

// Inicia el servidor
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});