const admin = require("firebase-admin");
const serviceAccount = require("../firebaseKey.json"); // Ajusta la ruta si es necesario

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore(); // Conexión con Firestore

module.exports = { db };
