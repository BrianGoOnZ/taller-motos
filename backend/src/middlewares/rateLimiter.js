import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiadas solicitudes, intenta de nuevo más tarde" },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Demasiados intentos de inicio de sesión, intenta más tarde",
  },
});

// Limita las peticiones por IP (300 req/15 min generales y 10 intentos/15 min en login)
// para prevenir ataques de fuerza bruta y saturación.
