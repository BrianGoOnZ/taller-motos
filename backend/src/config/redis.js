import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

redisClient.on("error", (err) => console.error("Error de Redis:", err.message));
redisClient.on("connect", () => console.log("Redis conectado correctamente"));

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

export const CACHE_TTL_SECONDS = 300;

export default redisClient;

// Configura la conexión con Redis para el manejo de caché rápida
// (TTL de 5 min) y listas negras de tokens.
