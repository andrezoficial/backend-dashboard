require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User"); // Asegúrate de que esta ruta esté bien

async function crearAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB");

    const email = "admin@admin.com";
    const yaExiste = await User.findOne({ email });

    if (yaExiste) {
      console.log("⚠️ Ya existe un usuario con ese correo");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = new User({
      nombre: "Administrador",
      email,
      rol: "admin",
      password: hashedPassword,
    });

    await admin.save();
    console.log("✅ Usuario admin creado correctamente");
    process.exit();
  } catch (error) {
    console.error("❌ Error al crear usuario:", error);
    process.exit(1);
  }
}

crearAdmin();
