const { ObtenerDatos, escribirArchivoJson } = require("./datos");
const { v4: uuidv4 } = require('uuid');

// Obtener todos los estudiantes ordenados por GR
const StudensGet = (req, res) => {
  const data = ObtenerDatos();
  // Filtrar estudiantes con GR válido
  const estudiantesValidos = data.filter((estudiante) => estudiante.GR != null);

  // Ordenar los estudiantes por el campo GR
  const estudiantesOrdenados = estudiantesValidos.sort((a, b) => {
    const grA = String(a.GR); // Convertir a string para asegurar compatibilidad
    const grB = String(b.GR);

    return grA.localeCompare(grB);
  });

  res.json(estudiantesOrdenados);
};

const AddEstudiante = (req, res) => {
  try {
      // Leer los datos actuales
      const data = ObtenerDatos();

      // Extraer los campos del cuerpo de la solicitud
      const {
          GR,
          DNI,
          APELLIDOS_NOMBRES,
          SEXO,
          APODERADO,
          CELULAR,
          SITUACIÓN_MATRICULA,
          COMPROMISO_DOCUMENTOS,
          APAFA,
          QALIWARMA,
          TARJETA_SALUD,
          CONADIS,
          DIRECCIÓN,
          RELIGIÓN,
          CELULAR_ADICIONAL,
          NOMBRE,
          PARENTESCO,
          OBSERVACIÓN
      } = req.body;

      // Validar campos obligatorios
      const camposObligatorios = [
          GR,
          DNI,
          APELLIDOS_NOMBRES,
          SEXO
      ];

      if (camposObligatorios.some((campo) => !campo)) {
          return res.status(400).json({ error: "Faltan campos obligatorios" });
      }

      // Crear un nuevo estudiante con un ID único
      const nuevoEstudiante = {
          // Genera un ID único con uuid
          GR,
          DNI,
          APELLIDOS_NOMBRES,
          SEXO,
          APODERADO,
          CELULAR,
          SITUACIÓN_MATRICULA,
          COMPROMISO_DOCUMENTOS,
          APAFA,
          QALIWARMA,
          TARJETA_SALUD,
          CONADIS,
          DIRECCIÓN,
          RELIGIÓN,
          CELULAR_ADICIONAL,
          NOMBRE,
          PARENTESCO,
          OBSERVACIÓN,
          id: uuidv4()
      };

      // Agregar el nuevo estudiante a los datos existentes
      data.push(nuevoEstudiante);

      // Guardar los datos actualizados en el archivo JSON
      escribirArchivoJson(data);

      // Responder con éxito
      res.status(201).json({
          success: "Estudiante agregado correctamente",
          estudiante: nuevoEstudiante
      });
  } catch (error) {
      console.error('Error al agregar el estudiante:', error);
      res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Filtrar estudiantes por nombre
const FiltrarPorNombre = (req, res) => {
  const data = ObtenerDatos();
  const { nombre } = req.query;

  if (!nombre) {
    return res.status(400).json({ error: "El parámetro 'nombre' es requerido" });
  }

  const estudiantesFiltrados = data.filter((estudiante) =>
    estudiante.APELLIDOS_NOMBRES.toLowerCase().includes(nombre.toLowerCase())
  );

  if (estudiantesFiltrados.length === 0) {
    return res.status(200).json([]); // Devuelve un arreglo vacío con estado 200
    // Opcional: devolver un objeto con un mensaje
    // return res.status(200).json({ message: "No se encontraron estudiantes", data: [] });
  }

  res.json(estudiantesFiltrados);
};

// Buscar estudiantes por DNI
const BuscarEstudianteDni = (req, res) => {
  const data = ObtenerDatos();
  const { dni } = req.query;

  if (!dni) {
    return res.status(400).json({ error: "El parámetro 'dni' es requerido" });
  }

  const estudiantesFiltrados = data.filter((estudiante) => estudiante.DNI === dni);

  if (estudiantesFiltrados.length === 0) {
    return res.status(200).json([]); // Devuelve un arreglo vacío con estado 200
    // Opcional: devolver un objeto con un mensaje
    // return res.status(200).json({ message: "No se encontró el estudiante", data: [] });
  }

  res.json(estudiantesFiltrados);
};

const EditarEstudiante = (req, res) => {
  const data = ObtenerDatos();
  const { id } = req.params; // Ahora se usa el ID como parámetro en la URL
  const nuevosDatos = req.body;

  // Buscar el índice del estudiante por ID
  const indiceEstudiante = data.findIndex((estudiante) => estudiante.id === id);

  if (indiceEstudiante === -1) {
    return res.status(404).json({ error: "Estudiante no encontrado" });
  }

  // Actualizar los datos del estudiante
  data[indiceEstudiante] = { ...data[indiceEstudiante], ...nuevosDatos };

  // Guardar los datos actualizados en el archivo JSON
  escribirArchivoJson(data);

  res.json({
    success: "Estudiante actualizado correctamente",
    estudiante: data[indiceEstudiante],
  });
};

const ExcelJS = require('exceljs');


// Endpoint para descargar el archivo Excel
const ExportarExcel = async (req, res) => {
  try {
      // Crear un nuevo libro de Excel
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Estudiantes');

      // Obtener los datos de los estudiantes
      const students = await ObtenerDatos(); // Asegúrate de que esta función devuelva los datos correctamente

      // Definir los encabezados del archivo Excel
      worksheet.columns = [
          { header: 'Grado', key: 'GR', width: 15 },
          { header: 'DNI', key: 'DNI', width: 15 },
          { header: 'Apellidos y Nombres', key: 'APELLIDOS_NOMBRES', width: 30 },
          { header: 'Sexo', key: 'SEXO', width: 10 },
          { header: 'Apoderado', key: 'APODERADO', width: 20 },
          { header: 'Celular', key: 'CELULAR', width: 15 },
          { header: 'Situación Matrícula', key: 'SITUACIÓN_MATRICULA', width: 20 },
          { header: 'Compromiso Documentos', key: 'COMPROMISO_DOCUMENTOS', width: 20 },
          { header: 'APAFA', key: 'APAFA', width: 10 },
          { header: 'Qali Warma', key: 'QALIWARMA', width: 15 },
          { header: 'Tarjeta Salud', key: 'TARJETA_SALUD', width: 15 },
          { header: 'CONADIS', key: 'CONADIS', width: 10 },
          { header: 'Dirección', key: 'DIRECCIÓN', width: 30 },
          { header: 'Religión', key: 'RELIGIÓN', width: 15 },
          { header: 'Celular Adicional', key: 'CELULAR_ADICIONAL', width: 15 },
          { header: 'Nombre Apoderado', key: 'NOMBRE', width: 20 },
          { header: 'Parentesco', key: 'PARENTESCO', width: 15 },
          { header: 'Observación', key: 'OBSERVACIÓN', width: 30 },
      ];

      // Agregar filas con los datos de los estudiantes
      students.forEach(student => {
          worksheet.addRow({
              GR: typeof student.GR === 'string' ? student.GR.trim() : '', // Validación para .trim()
              DNI: student.DNI || '',
              APELLIDOS_NOMBRES: student.APELLIDOS_NOMBRES || '',
              SEXO: student.SEXO || '',
              APODERADO: student.APODERADO || '',
              CELULAR: student.CELULAR || '',
              SITUACIÓN_MATRICULA: student.SITUACIÓN_MATRICULA || '',
              COMPROMISO_DOCUMENTOS: student.COMPROMISO_DOCUMENTOS || '',
              APAFA: student.APAFA || '',
              QALIWARMA: student.QALIWARMA || '',
              TARJETA_SALUD: student.TARJETA_SALUD || '',
              CONADIS: student.CONADIS || '',
              DIRECCIÓN: student.DIRECCIÓN || '',
              RELIGIÓN: student.RELIGIÓN || '',
              CELULAR_ADICIONAL: student.CELULAR_ADICIONAL || '',
              NOMBRE: student.NOMBRE || '',
              PARENTESCO: student.PARENTESCO || '',
              OBSERVACIÓN: student.OBSERVACIÓN || ''
          });
      });

      // Configurar la respuesta HTTP para descargar el archivo
      res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
          'Content-Disposition',
          'attachment; filename=estudiantes.xlsx'
      );

      // Escribir el archivo Excel en la respuesta
      await workbook.xlsx.write(res);
      res.end();
  } catch (error) {
      console.error('Error al generar el archivo Excel:', error);
      res.status(500).send('Error al generar el archivo Excel');
  }
};



module.exports = {
  StudensGet,
  AddEstudiante,
  FiltrarPorNombre,
  BuscarEstudianteDni,
  EditarEstudiante,
  ExportarExcel
};