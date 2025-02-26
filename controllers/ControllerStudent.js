const { obtenerDatos, escribirDatos } = require("../config/datos");
const { v4: uuidv4 } = require('uuid');
const ExcelJS = require('exceljs');

// Obtener todos los estudiantes ordenados por GR
const StudensGet = async (req, res) => {
  try {
    const data = await obtenerDatos();

    if (!Array.isArray(data)) {
      return res.status(500).json({ error: "Datos en formato incorrecto" });
    }

    const estudiantesValidos = data.filter((estudiante) => estudiante.GR != null);
    const estudiantesOrdenados = estudiantesValidos.sort((a, b) => 
      String(a.GR).localeCompare(String(b.GR))
    );

    res.json(estudiantesOrdenados);
  } catch (error) {
    console.error("Error en StudentsGet:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Agregar un estudiante
const AddEstudiante = async (req, res) => {
  try {
    const data = await obtenerDatos("students");

    const {
      GR, DNI, APELLIDOS_NOMBRES, SEXO, APODERADO, CELULAR, SITUACIÓN_MATRICULA,
      COMPROMISO_DOCUMENTOS, APAFA, QALIWARMA, TARJETA_SALUD, CONADIS, DIRECCIÓN,
      RELIGIÓN, CELULAR_ADICIONAL, NOMBRE, PARENTESCO, OBSERVACIÓN
    } = req.body;

    if (![GR, DNI, APELLIDOS_NOMBRES, SEXO].every(Boolean)) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const nuevoEstudiante = {
      id: uuidv4(),
      GR, DNI, APELLIDOS_NOMBRES, SEXO, APODERADO, CELULAR, SITUACIÓN_MATRICULA,
      COMPROMISO_DOCUMENTOS, APAFA, QALIWARMA, TARJETA_SALUD, CONADIS, DIRECCIÓN,
      RELIGIÓN, CELULAR_ADICIONAL, NOMBRE, PARENTESCO, OBSERVACIÓN
    };

    data.push(nuevoEstudiante);

    if (typeof escribirDatos === "function") {
      await escribirDatos("students", data);
    } else {
      return res.status(500).json({ error: "No se puede escribir en la base de datos" });
    }

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
const FiltrarPorNombre = async (req, res) => {
  try {
    const data = await obtenerDatos("students");
    const { nombre } = req.query;

    if (!nombre) {
      return res.status(400).json({ error: "El parámetro 'nombre' es requerido" });
    }

    const estudiantesFiltrados = data.filter((estudiante) =>
      estudiante.APELLIDOS_NOMBRES.toLowerCase().includes(nombre.toLowerCase())
    );

    res.status(200).json(estudiantesFiltrados);
  } catch (error) {
    console.error("Error en FiltrarPorNombre:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Buscar estudiante por DNI
const BuscarEstudianteDni = async (req, res) => {
  try {
    const data = await obtenerDatos("students");
    const { dni } = req.query;

    if (!dni) {
      return res.status(400).json({ error: "El parámetro 'dni' es requerido" });
    }

    const estudiante = data.find((estudiante) => estudiante.DNI === dni);

    res.status(200).json(estudiante ? [estudiante] : []);
  } catch (error) {
    console.error("Error en BuscarEstudianteDni:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Editar estudiante
const EditarEstudiante = async (req, res) => {
  try {
    const data = await obtenerDatos("students");
    const { id } = req.params;
    const nuevosDatos = req.body;

    const indiceEstudiante = data.findIndex((estudiante) => estudiante.id === id);

    if (indiceEstudiante === -1) {
      return res.status(404).json({ error: "Estudiante no encontrado" });
    }

    data[indiceEstudiante] = { ...data[indiceEstudiante], ...nuevosDatos };

    if (typeof escribirDatos === "function") {
      await escribirDatos();
    }

    res.json({
      success: "Estudiante actualizado correctamente",
      estudiante: data[indiceEstudiante],
    });

  } catch (error) {
    console.error("Error en EditarEstudiante:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Exportar datos a Excel
const ExportarExcel = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Estudiantes');

    const students = await obtenerDatos("students");

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

    students.forEach(student => {
      worksheet.addRow({ ...student });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=estudiantes.xlsx'
    );

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
