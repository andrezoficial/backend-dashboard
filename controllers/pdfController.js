const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const HistoriaClinica = require("../models/HistoriaClinica");

exports.generarPDFHistoriaClinica = async (req, res) => {
  try {
    const { pacienteId } = req.params;

    const historia = await HistoriaClinica.findOne({ paciente: pacienteId }).populate("paciente");
    if (!historia) return res.status(404).json({ message: "Historia no encontrada" });

    // Crear documento PDF
    const doc = new PDFDocument();
    const filename = `historia-clinica-${historia.paciente.numeroDocumento}.pdf`;

    // Enviar headers de descarga
    res.setHeader("Content-disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-type", "application/pdf");

    doc.pipe(res);

    // Encabezado
    doc.fontSize(20).text("Historia Clínica", { align: "center" });
    doc.moveDown();

    // Datos del paciente
    doc.fontSize(12).text(`Nombre completo: ${historia.paciente.nombreCompleto}`);
    doc.text(`Tipo de documento: ${historia.paciente.tipoDocumento}`);
    doc.text(`Número de documento: ${historia.paciente.numeroDocumento}`);
    doc.text(`Sexo: ${historia.paciente.sexo}`);
    doc.text(`Correo: ${historia.paciente.correo}`);
    doc.text(`Teléfono: ${historia.paciente.telefono}`);
    doc.text(`EPS: ${historia.paciente.eps}`);
    doc.moveDown();

    // Datos de la historia clínica
    doc.fontSize(14).text("Información clínica", { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(12).text(`Motivo de consulta: ${historia.motivoConsulta}`);
    doc.text(`Diagnóstico: ${historia.diagnostico || "No especificado"}`);
    doc.text(`Procedimientos: ${historia.procedimientos?.join(", ") || "Ninguno registrado"}`);
    doc.text(`Fecha de creación: ${historia.createdAt.toLocaleString("es-CO")}`);
    doc.text(`Última actualización: ${historia.updatedAt.toLocaleString("es-CO")}`);

    doc.end();
  } catch (error) {
    console.error("Error al generar PDF:", error);
    res.status(500).json({ message: "Error al generar el PDF" });
  }
};
