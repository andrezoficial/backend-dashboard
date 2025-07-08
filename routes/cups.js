router.get("/", async (req, res) => {
  const query = req.query.q || "";
  try {
    const cups = await Cups.find(
      {
        $or: [
          { codigo: { $regex: query, $options: "i" } },
          { nombre: { $regex: query, $options: "i" } }
        ]
      }
    )
      .limit(20)
      .lean();

    console.log("👉 Documentos encontrados:", cups); // 🔍 imprime los resultados reales

    const options = cups.map(cup => ({
      value: cup.codigo,
      label: `${cup.codigo} - ${cup.nombre}`
    }));

    res.json(options);
  } catch (err) {
    console.error("Error al buscar CUPS:", err);
    res.status(500).json({ message: "Error al buscar CUPS" });
  }
});
