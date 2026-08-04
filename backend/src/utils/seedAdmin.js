import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { User } from "../models/index.js";

dotenv.config();

const seedAdmin = async () => {
  await connectDB();

  const existing = await User.findOne({ where: { username: "admin" } });
  if (existing) {
    console.log("El usuario admin ya existe, no se crea duplicado");
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash("admin123", 10);

  await User.create({
    username: "admin",
    passwordHash,
    fullName: "Administrador del Sistema",
    role: "admin",
    isActive: true,
  });

  console.log("Usuario admin creado: username=admin / password=admin123");
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error("Error al crear el usuario admin:", err.message);
  process.exit(1);
});

// Es un script ejecutable independiente que se encarga de sembrar (seed)
// la base de datos con la cuenta del usuario administrador inicial.
// Garantiza que el sistema siempre tenga al menos un súper usuario para poder
// iniciar sesión por primera vez tras la instalación o el despliegue del proyecto.
