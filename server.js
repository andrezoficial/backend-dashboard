require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const User = require("./models/User");

const app = express();
app.use(cors());
app.use(express.json());
const rolesRoutes = require("./routes/roles");
app.use("/api/roles", rolesRoutes);
app.get('/api/pingdb', async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    res.json({ status: "ok", collections });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});


// Conectar a MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch((err) => {
    console.error("❌ Error de conexión a MongoDB:", err);
  });

// CRUD Usuarios

// Listar usuarios
app.get("/api/usuarios", async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // Excluir password
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

    // En un sistema real, aquí se debe hashear la contraseña (bcrypt)
    const nuevoUsuario = new User({ nombre, email, rol, password });
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
    const { nombre, email, rol } = req.body;

    const usuario = await User.findById(id);
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    usuario.nombre = nombre ?? usuario.nombre;
    usuario.email = email ?? usuario.email;
    usuario.rol = rol ?? usuario.rol;

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
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
