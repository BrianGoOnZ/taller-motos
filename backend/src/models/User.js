import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    fullName: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "empleado", "mecanico"),
      allowNull: false,
      defaultValue: "empleado",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "User",
  },
);

export default User;

// Representa la tabla User en MySQL. Almacena las cuentas de acceso del personal del taller
// (administradores, empleados y mecánicos), gestionando sus credenciales de inicio de sesión
// y sus roles de permisos.
