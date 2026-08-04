import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ServiceOrderPart = sequelize.define(
  "ServiceOrderPart",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    serviceOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    motorcyclePartId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantityUsed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "ServiceOrderPart",
  },
);

export default ServiceOrderPart;

// Es la tabla pivote (intermedia) que conecta las Órdenes de Servicio con las Refacciones
// (N:M). Almacena el detalle exacto de qué piezas y cuántas unidades se gastaron en cada
// reparación, congelando el precio unitario en ese momento.
