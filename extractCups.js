const fs = require("fs");
const pdf2table = require("pdf2table");

// Cambia la ruta por tu PDF descargado
const pdfPath = "./Resolucion-No-2641-de-2024.pdf";

fs.readFile(pdfPath, (err, buffer) => {
  if (err) throw err;
  pdf2table.parse(buffer, (err, rows, rowsdebug) => {
    if (err) {
      console.error("Error parseando PDF:", err);
      process.exit(1);
    }

    // Asumiendo que rows[0] es la cabecera
    const lines = rows.map(cells => cells.join(","));
    fs.writeFileSync("cups.csv", lines.join("\n"), "utf8");
    console.log("✅ cups.csv creado con", rows.length, "líneas");
  });
});
