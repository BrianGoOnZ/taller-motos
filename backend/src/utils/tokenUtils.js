import jwt from "jsonwebtoken";
import crypto from "crypto";

export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES },
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES,
  });
};

// Los refresh tokens ya tienen alta entropía (JWT firmado), por eso se
// usa un hash rápido (sha256) para guardarlos, no bcrypt (pensado para
// contraseñas de baja entropía elegidas por humanos).
export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const getRefreshExpiryDate = () => {
  const hours = parseInt(process.env.REFRESH_TOKEN_EXPIRES, 10) || 8;
  return new Date(Date.now() + hours * 60 * 60 * 1000);
};

// Es un módulo de utilidades de criptografía y manejo de tokens.
// Centraliza la firma de JWTs (Access Tokens y Refresh Tokens),
// el cálculo del hash criptográfico rápido para almacenar los Refresh Tokens de forma segura
// en la base de datos, y el cálculo de sus tiempos de expiración.
