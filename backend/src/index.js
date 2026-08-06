import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";

import { connectDB } from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import "./models/index.js";
import authRoutes from "./routes/authRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import motorcycleRoutes from "./routes/motorcycleRoutes.js";
import receptionRoutes from "./routes/receptionRoutes.js";
import serviceOrderRoutes from "./routes/serviceOrderRoutes.js";
import swaggerSpec from "./config/swagger.js";
import { globalLimiter } from "./middlewares/rateLimiter.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(globalLimiter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/motorcycles", motorcycleRoutes);
app.use("/api/reception", receptionRoutes);
app.use("/api/service-orders", serviceOrderRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await connectRedis();
  app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en el puerto ${PORT}`);
    console.log(
      `Documentación disponible en http://localhost:${PORT}/api-docs`,
    );
  });
};

startServer();
