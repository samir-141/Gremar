const { obtenerDatos, escribirDatos } = require("../config/datos");
const { v4: uuidv4 } = require('uuid');
const ExcelJS = require('exceljs');

const StudensGet = async (req, res) => {
  try {
    const data = await obtenerDatos();

    let estudiantes;
    if (Array.isArray(data)) {
      estudiantes = data;
    } else if (data && Array.isArray(data.students)) {
      estudiantes = data.students;
    } else {
      return res.status(500).json({ error: "Datos en formato incorrecto" });
    }

    const estudiantesValidos = estudiantes.filter((estudiante) => estudiante.GR != null);
    const estudiantesOrdenados = estudiantesValidos.sort((a, b) => 
      String(a.GR).localeCompare(String(b.GR))
    );

    res.json(estudiantesOrdenados);
  } catch (error) {
    console.error("Error en StudensGet:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const AddEstudiante = async (req, res) => {
  try {
    const estudiantes = await obtenerDatos();
    const {
      GR, DNI, APELLIDOS_NOMBRES, SEXO, APODERADO, CELULAR, SITUACIÓN_MATRICULA,
      COMPROMISO_DOCUMENTOS, APAFA, QALIWARMA, TARJETA_SALUD, CONADIS, DIRECCIÓN,
      RELIGIÓN, CELULAR_ADICIONAL, NOMBRE, PARENTESCO, OBSERVACIÓN
    } = req.body;

    if (!GR || !DNI || !APELLIDOS_NOMBRES || !SEXO) {
      return res.status(400).json({ error: "Faltan campos obligatorios: GR, DNI, APELLIDOS_NOMBRES, SEXO" });
    }

    const nuevoEstudiante = {
      id: uuidv4(),
      GR, DNI, APELLIDOS_NOMBRES, SEXO, APODERADO, CELULAR, SITUACIÓN_MATRICULA,
      COMPROMISO_DOCUMENTOS, APAFA, QALIWARMA, TARJETA_SALUD, CONADIS, DIRECCIÓN,
      RELIGIÓN, CELULAR_ADICIONAL, NOMBRE, PARENTESCO, OBSERVACIÓN,
      createdAt: new Date().toISOString()
    };

    estudiantes.push(nuevoEstudiante);
    await escribirDatos(estudiantes);

    res.status(201).json({
      success: "Estudiante agregado correctamente",
      estudiante: nuevoEstudiante
    });
  } catch (error) {
    console.error('Error al agregar el estudiante:', error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const FiltrarPorNombre = async (req, res) => {
  try {
    const estudiantes = await obtenerDatos();
    const { nombre } = req.query;

    if (!nombre) {
      return res.status(400).json({ error: "El parámetro 'nombre' es requerido" });
    }

    const estudiantesFiltrados = estudiantes.filter((estudiante) =>
      estudiante.APELLIDOS_NOMBRES?.toLowerCase().includes(nombre.toLowerCase())
    );

    res.status(200).json(estudiantesFiltrados);
  } catch (error) {
    console.error("Error en FiltrarPorNombre:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const BuscarEstudianteDni = async (req, res) => {
  try {
    const estudiantes = await obtenerDatos();
    const { dni } = req.query;

    if (!dni) {
      return res.status(400).json({ error: "El parámetro 'dni' es requerido" });
    }

    const estudiante = estudiantes.find((estudiante) => estudiante.DNI === dni);
    res.status(200).json(estudiante ? [estudiante] : []);
  } catch (error) {
    console.error("Error en BuscarEstudianteDni:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const EditarEstudiante = async (req, res) => {
  try {
    const estudiantes = await obtenerDatos();
    const { id } = req.params;
    const nuevosDatos = req.body;

    const indiceEstudiante = estudiantes.findIndex((estudiante) => estudiante.id === id);
    if (indiceEstudiante === -1) {
      return res.status(404).json({ error: "Estudiante no encontrado" });
    }

    estudiantes[indiceEstudiante] = { 
      ...estudiantes[indiceEstudiante], 
      ...nuevosDatos,
      updatedAt: new Date().toISOString()
    };

    await escribirDatos(estudiantes);

    res.json({
      success: "Estudiante actualizado correctamente",
      estudiante: estudiantes[indiceEstudiante],
    });
  } catch (error) {
    console.error("Error en EditarEstudiante:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const ExportarExcel = async (req, res) => {
  try {
    const estudiantes = await obtenerDatos();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Estudiantes');

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

    worksheet.addRows(estudiantes);

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