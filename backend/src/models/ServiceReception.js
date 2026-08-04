import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ServiceReception = sequelize.define(
  "ServiceReception",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    motorcycleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    receivedByUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    reportedFailure: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("EN_ESPERA", "EN_PROCESO", "LISTO", "ENTREGADO"),
      allowNull: false,
      defaultValue: "EN_ESPERA",
    },
    entryDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    exitDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "ServiceReception",
  },
);

export default ServiceReception;

// Representa la tabla ServiceReception en MySQL.
// Registra el ingreso del vehículo al taller, guardando la falla reportada por el cliente,
// las fechas de entrada y salida, el empleado que la recibió y el estado general del servicio.
