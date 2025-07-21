const mongoose = require("mongoose");

const historiaClinicaSchema = new mongoose.Schema(
  {
    // 1. DATOS BÁSICOS
    paciente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Paciente",
      required: true,
    },
    identificacion: {
      tipo: { type: String, required: true },
      numero: { type: String, required: true },
    },
    fechaNacimiento: { type: Date, required: true },
    edad: { type: Number },
    sexo: { type: String, enum: ["Masculino", "Femenino", "Otro"], required: true },
    estadoCivil: { type: String },
    ocupacion: { type: String },
    direccion: { type: String },
    telefono: { type: String },
    correo: { type: String },
    eps: { type: String },
    contactoEmergencia: {
      nombre: String,
      relacion: String,
      telefono: String,
    },

    // Profesional que atiende
    profesional: {
      nombre: { type: String },
      identificacion: { type: String },
      tarjetaProfesional: { type: String },
      especialidad: { type: String },
      firmaDigital: { type: String }, // URL o base64 de la firma si aplica
    },

    // 2. CONTENIDO CLÍNICO
    motivoConsulta: {
      descripcion: String,
      tiempoEvolucion: String,
      caracteristicas: String,
    },

    antecedentes: {
      personales: {
        habitos: String,
        alergias: String,
        medicamentosHabituales: String,
      },
      familiares: String,
      patologicos: String,
      farmacologicos: String,
    },

    examenFisico: {
      signosVitales: {
        tensionArterial: String,
        frecuenciaCardiaca: String,
        frecuenciaRespiratoria: String,
        temperatura: String,
        peso: String,
        talla: String,
        imc: String,
      },
      hallazgos: String,
      examenPorSistemas: String,
    },

    diagnosticos: {
      presuntivos: [
        {
          codigoCIE11: String,
          descripcion: String,
        },
      ],
      definitivos: [
        {
          codigoCIE11: String,
          descripcion: String,
        },
      ],
      diferenciales: [
        {
          codigoCIE11: String,
          descripcion: String,
        },
      ],
    },

    tratamiento: {
      medicamentos: [
        {
          nombreGenerico: String,
          dosis: String,
          frecuencia: String,
          duracion: String,
        },
      ],
      procedimientos: [
        {
          codigoCUPS: String,
          nombre: String,
        },
      ],
      ordenesMedicas: String,
      formulasMedicas: String,
    },

    evolucion: [
      {
        fecha: { type: Date, default: Date.now },
        nota: String,
        cambiosTratamiento: String,
        respuestaTratamiento: String,
      },
    ],

    recomendaciones: {
      indicaciones: String,
      citaControl: String,
      promocionSalud: String,
    },

    // 3. ASPECTOS LEGALES Y SEGURIDAD
    consentimientos: {
      procedimientos: Boolean,
      tratamiento: Boolean,
      manejoDatos: Boolean,
    },
    autorizaciones: {
      tratamientoDatos: Boolean,
      usoImagenes: Boolean,
      informacionTerceros: Boolean,
    },
    trazabilidad: [
      {
        usuario: String,
        fecha: { type: Date, default: Date.now },
        accion: String, // creado, modificado, accedido
        justificacion: String,
      },
    ],

    // 4. DATOS ADICIONALES RECOMENDADOS
    factoresSociales: {
      vivienda: String,
      alimentacion: String,
    },
    riesgoPsicosocial: String,
    estiloVida: String,
    datosAntropometricos: {
      perimetroCintura: String,
      perimetroCadera: String,
    },
    vacunas: [
      {
        nombre: String,
        fecha: Date,
      },
    ],
    alertasClinicas: {
      alergias: String,
      reaccionesAdversas: String,
    },

    // 5. TECNOLÓGICOS
    firmaDigitalProfesional: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("HistoriaClinica", historiaClinicaSchema);
