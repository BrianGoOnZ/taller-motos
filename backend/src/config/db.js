import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    define: {
      timestamps: true,
      freezeTableName: true,
    },
    pool: {
      max: 20,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("MySQL conectado correctamente");
  } catch (error) {
    console.error("Error de conexión a MySQL:", error.message);
    process.exit(1);
  }
};

export default sequelize;

//Crea la conexión principal a MySQL usando Sequelize
//con un pool de hasta 20 conexiones y timestamps automáticos.
