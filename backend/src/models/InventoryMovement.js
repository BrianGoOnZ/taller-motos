import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const InventoryMovement = sequelize.define(
  "InventoryMovement",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    motorcyclePartId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    movementType: {
      type: DataTypes.ENUM("ENTRADA", "SALIDA", "AJUSTE"),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    serviceOrderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "InventoryMovement",
  },
);

export default InventoryMovement;

// Representa la tabla InventoryMovement en MySQL.
// Funciona como la bitácora de auditoría del almacén, registrando cada entrada,
// salida o ajuste manual de repuestos para garantizar la trazabilidad del stock.
