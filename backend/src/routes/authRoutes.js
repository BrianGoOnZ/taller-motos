import { Router } from "express";
import { login, refresh, logout, me } from "../controllers/authController.js";
import { protect } from "../middlewares/protect.js";
import { authLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login exitoso, tokens en cookies HttpOnly
 *       401:
 *         description: Credenciales inválidas
 */
router.post("/login", authLimiter, login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Renovar el Access Token usando el Refresh Token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token renovado
 *       401:
 *         description: Sesión expirada
 */
router.post("/refresh", refresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Sesión cerrada
 */
router.post("/logout", logout);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Obtener datos del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario
 *       401:
 *         description: No autenticado
 */
router.get("/me", protect, me);

export default router;

// Define los endpoints HTTP de autenticación y acceso al sistema (/auth/*),
// conectando las solicitudes de la API con sus respectivos controladores y
// aplicando middlewares de seguridad. Además, incluye la documentación JSDoc para Swagger UI.
