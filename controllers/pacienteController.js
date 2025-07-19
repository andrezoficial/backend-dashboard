const Paciente = require("../models/paciente");

// Listar todos los pacientes
exports.listarPacientes = async (req, res) => {
  try {
    const pacientes = await Paciente.find();
    res.json(pacientes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pacientes' });
  }
};

// Crear un paciente nuevo
exports.crearPaciente = async (req, res) => {
  const {
    nombreCompleto,
    tipoDocumento,
    numeroDocumento,
    sexo,
    correo,
    telefono,
    eps,
    fechaNacimiento,
    direccion = "",
    estadoCivil = "Soltero(a)",
    ocupacion = "",
    contactoEmergenciaNombre = "",
    contactoEmergenciaTelefono = "",
  } = req.body;

  // Validar campos obligatorios
  if (!nombreCompleto || !tipoDocumento || !numeroDocumento || !sexo || !correo || !telefono || !eps || !fechaNacimiento) {
    return res.status(400).json({ error: 'Todos los campos obligatorios deben estar completos' });
  }

  // Validar tipoDocumento y sexo contra enum
  const tiposDocumentoValidos = ['cc', 'ti', 'ce'];
  const sexosValidos = ['Masculino', 'Femenino', 'Otro'];

  if (!tiposDocumentoValidos.includes(tipoDocumento)) {
    return res.status(400).json({ error: 'Tipo de documento inválido' });
  }

  if (!sexosValidos.includes(sexo)) {
    return res.status(400).json({ error: 'Sexo inválido' });
  }

  try {
    // Verificar si ya existe paciente con mismo correo o documento
    const existeCorreo = await Paciente.findOne({ correo });
    if (existeCorreo) return res.status(400).json({ error: 'Correo ya registrado' });

    const existeDocumento = await Paciente.findOne({ numeroDocumento });
    if (existeDocumento) return res.status(400).json({ error: 'Número de documento ya registrado' });

    // Crear y guardar paciente
    const nuevoPaciente = new Paciente({
      nombreCompleto,
      tipoDocumento,
      numeroDocumento,
      sexo,
      correo,
      telefono,
      eps,
      fechaNacimiento,
      direccion,
      estadoCivil,
      ocupacion,
      contactoEmergenciaNombre,
      contactoEmergenciaTelefono,
    });

    await nuevoPaciente.save();
    res.status(201).json(nuevoPaciente);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear paciente' });
  }
};

// Actualizar paciente por id
exports.actualizarPaciente = async (req, res) => {
  const { id } = req.params;
  const {
    nombreCompleto,
    tipoDocumento,
    numeroDocumento,
    sexo,
    correo,
    telefono,
    eps,
    fechaNacimiento,
    direccion = "",
    estadoCivil = "Soltero(a)",
    ocupacion = "",
    contactoEmergenciaNombre = "",
    contactoEmergenciaTelefono = "",
  } = req.body;

  // Validar campos obligatorios
  if (!nombreCompleto || !tipoDocumento || !numeroDocumento || !sexo || !correo || !telefono || !eps || !fechaNacimiento) {
    return res.status(400).json({ error: 'Todos los campos obligatorios deben estar completos' });
  }

  const tiposDocumentoValidos = ['cc', 'ti', 'ce'];
  const sexosValidos = ['Masculino', 'Femenino', 'Otro'];

  if (!tiposDocumentoValidos.includes(tipoDocumento)) {
    return res.status(400).json({ error: 'Tipo de documento inválido' });
  }

  if (!sexosValidos.includes(sexo)) {
    return res.status(400).json({ error: 'Sexo inválido' });
  }

  try {
    const paciente = await Paciente.findById(id);
    if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado' });

    // Validar unicidad si correo o documento cambian
    if (correo !== paciente.correo) {
      const existeCorreo = await Paciente.findOne({ correo });
      if (existeCorreo) return res.status(400).json({ error: 'Correo ya registrado' });
    }

    if (numeroDocumento !== paciente.numeroDocumento) {
      const existeDocumento = await Paciente.findOne({ numeroDocumento });
      if (existeDocumento) return res.status(400).json({ error: 'Número de documento ya registrado' });
    }

    // Actualizar campos
    paciente.nombreCompleto = nombreCompleto;
    paciente.tipoDocumento = tipoDocumento;
    paciente.numeroDocumento = numeroDocumento;
    paciente.sexo = sexo;
    paciente.correo = correo;
    paciente.telefono = telefono;
    paciente.eps = eps;
    paciente.fechaNacimiento = fechaNacimiento;
    paciente.direccion = direccion;
    paciente.estadoCivil = estadoCivil;
    paciente.ocupacion = ocupacion;
    paciente.contactoEmergenciaNombre = contactoEmergenciaNombre;
    paciente.contactoEmergenciaTelefono = contactoEmergenciaTelefono;

    await paciente.save();
    res.json(paciente);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar paciente' });
  }
};

// Eliminar paciente por id
exports.eliminarPaciente = async (req, res) => {
  try {
    const { id } = req.params;
    const paciente = await Paciente.findByIdAndDelete(id);
    if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar paciente' });
  }
};
