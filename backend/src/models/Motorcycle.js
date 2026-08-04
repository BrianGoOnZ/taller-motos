import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Motorcycle = sequelize.define(
  "Motorcycle",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    licensePlate: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    brand: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    vin: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "Motorcycle",
  },
);

export default Motorcycle;

// Representa la tabla Motorcycle en MySQL.
// Se encarga de guardar la ficha técnica de cada vehículo que ingresa al taller
// y vincularlo con su respectivo dueño.
