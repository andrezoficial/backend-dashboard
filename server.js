// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const User = require("./models/User");
const chatRoute = require("./routes/chatbot");
const cupsRoutes = require("./routes/cups");
const historiaClinicaRoutes = require("./routes/historiaClinica");
const verificacionRoutes = require("./routes/verificacion");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/chatbot", chatRoute);
app.use("/api/cups", cupsRoutes);
app.use("/api/pacientes", historiaClinicaRoutes);
app.use("/api/verificacion", verificacionRoutes);

// Conexión a la base de datos
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch((err) => {
    console.error("❌ Error de conexión a MongoDB:", err);
  });

// Rutas
const rolesRoutes = require("./routes/roles");
const authRoutes = require("./routes/auth");
const pacientesRoutes = require("./routes/pacientes");  // <-- agregué esta línea
const citasRoutes = require("./routes/citas");
const configuracionRoutes = require("./routes/configuracion");

app.use("/api/configuracion", configuracionRoutes);
app.use("/api/citas", citasRoutes);

app.use("/api/roles", rolesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/pacientes", pacientesRoutes);  // <-- y esta

// Ruta para verificar conexión
app.get("/api/pingdb", async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    res.json({ status: "ok", collections });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// CRUD usuarios

// Listar usuarios
app.get("/api/usuarios", async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// Crear usuario
app.post("/api/usuarios", async (req, res) => {
  try {
    const { nombre, email, rol, password } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const existe = await User.findOne({ email });
    if (existe) {
      return res.status(400).json({ error: "Email ya registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const nuevoUsuario = new User({ nombre, email, rol, password: hashedPassword });
    await nuevoUsuario.save();

    const userSinPassword = {
      _id: nuevoUsuario._id,
      nombre: nuevoUsuario.nombre,
      email: nuevoUsuario.email,
      rol: nuevoUsuario.rol,
    };
    res.status(201).json(userSinPassword);
  } catch (error) {
    res.status(500).json({ error: "Error al crear usuario" });
  }
});

// Actualizar usuario
app.put("/api/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol, password } = req.body;

    const usuario = await User.findById(id);
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    usuario.nombre = nombre ?? usuario.nombre;
    usuario.email = email ?? usuario.email;
    usuario.rol = rol ?? usuario.rol;

    if (password && password.trim() !== "") {
      usuario.password = await bcrypt.hash(password, 10);
    }

    await usuario.save();

    const userSinPassword = {
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    };

    res.json(userSinPassword);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

// Eliminar usuario
app.delete("/api/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
