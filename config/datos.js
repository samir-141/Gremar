const { db } = require("./firebase");

/**
 * Obtiene todos los documentos de la colección "students" en Firestore.
 * @returns {Promise<Array>} Lista de estudiantes.
 */
const obtenerDatos = async () => {
  try {
    const snapshot = await db.collection("students").get();

    if (snapshot.empty) {
      console.warn("⚠️ No hay documentos en la colección.");
      return [];
    }

    const documentos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return documentos;
  } catch (error) {
    console.error("❌ Error al obtener datos de Firestore:", error.message);
    return [];
  }
};

/**
 * Agrega un nuevo documento a la colección especificada en Firestore.
 * @param {string} coleccion - Nombre de la colección en Firestore.
 * @param {Object} datos - Datos a guardar en Firestore.
 * @returns {Promise<Object>} Datos almacenados junto con el ID generado.
 */
const escribirDatos = async (coleccion, datos) => {
  try {
    if (!coleccion || typeof coleccion !== "string") {
      throw new Error("El nombre de la colección debe ser un string válido.");
    }
    
    if (!datos || typeof datos !== "object" || Object.keys(datos).length === 0) {
      throw new Error("Los datos a escribir deben ser un objeto no vacío.");
    }

    const docRef = await db.collection(coleccion).add(datos);
    return { id: docRef.id, ...datos };
  } catch (error) {
    console.error(`❌ Error al escribir datos en la colección "${coleccion}":`, error.message);
    throw new Error("Error al escribir datos: " + error.message);
  }
};

// Exportar funciones correctamente
module.exports = { obtenerDatos, escribirDatos };
