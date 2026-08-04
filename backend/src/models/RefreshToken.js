import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const RefreshToken = sequelize.define(
  "RefreshToken",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tokenHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isRevoked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "RefreshToken",
  },
);

export default RefreshToken;

// Representa la tabla RefreshToken en MySQL.
// Guarda la huella digital (hash) y el estado de caducidad de las sesiones de usuario
// para la rotación segura de tokens.
