const admin = require('firebase-admin');
const path = require("path");
// Cargar las credenciales desde el archivo descargado
const serviceAccount = require(path.join(__dirname, './serviceAccountKey.json'));

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const collectionRef = db.collection('usuarios'); // Ajusta el nombre de la colección si es diferente

let cacheDatos = null; // Caché en memoria

async function obtenerDatos() {
  try {
    if (cacheDatos) return cacheDatos; // Usar caché si existe

    const snapshot = await collectionRef.get();
    cacheDatos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return Array.isArray(cacheDatos) ? cacheDatos : [];
  } catch (error) {
    console.error("❌ Error al obtener datos de Firestore:", error.message);
    return [];
  }
}

async function escribirDatos(datos) {
  try {
    if (!Array.isArray(datos)) {
      throw new Error("Datos inválidos, debe ser un array.");
    }

    // Usar un batch para escribir todos los datos en Firestore
    const batch = db.batch();
    datos.forEach((dato) => {
      const docRef = collectionRef.doc(dato.id); // Usa el campo 'id' como clave
      batch.set(docRef, dato);
    });
    await batch.commit();

    cacheDatos = datos; // Actualizar caché
    return cacheDatos;
  } catch (error) {
    console.error("❌ Error al escribir en Firestore:", error.message);
    throw error;
  }
}

module.exports = { obtenerDatos, escribirDatos };