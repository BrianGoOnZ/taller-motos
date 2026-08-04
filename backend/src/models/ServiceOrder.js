import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ServiceOrder = sequelize.define(
  "ServiceOrder",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    serviceReceptionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    laborCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    totalPartsCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    totalCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM("ABIERTA", "CERRADA"),
      allowNull: false,
      defaultValue: "ABIERTA",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    closedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "ServiceOrder",
  },
);

export default ServiceOrder;

// Representa la tabla ServiceOrder en MySQL.
// Administra la orden de trabajo del taller, consolidando los costos de mano de obra,
// repuestos utilizados, el estado de la reparación (ABIERTA o CERRADA) y el mecánico asignado.
