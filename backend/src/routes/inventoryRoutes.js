import { Router } from "express";
import {
  getParts,
  getPartById,
  createPart,
  updatePart,
  deletePart,
  getPartMovements,
} from "../controllers/inventoryController.js";
import { protect, authorize } from "../middlewares/protect.js";

const router = Router();

router.use(protect);

/**
 * @openapi
 * /inventory:
 *   get:
 *     summary: Listar refacciones del catálogo
 *     tags: [Inventory]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de refacciones
 */
router.get("/", getParts);

/**
 * @openapi
 * /inventory/{id}:
 *   get:
 *     summary: Obtener una refacción por id
 *     tags: [Inventory]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Refacción encontrada
 *       404:
 *         description: No encontrada
 */
router.get("/:id", getPartById);

/**
 * @openapi
 * /inventory/{id}/movements:
 *   get:
 *     summary: Bitácora de movimientos de stock de una refacción
 *     tags: [Inventory]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de movimientos
 */
router.get("/:id/movements", getPartMovements);

/**
 * @openapi
 * /inventory:
 *   post:
 *     summary: Crear una nueva refacción
 *     tags: [Inventory]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       201:
 *         description: Refacción creada
 *       409:
 *         description: Código de refacción duplicado
 */
router.post("/", authorize("admin", "empleado"), createPart);

/**
 * @openapi
 * /inventory/{id}:
 *   put:
 *     summary: Actualizar una refacción (incluye ajuste de stock)
 *     tags: [Inventory]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Refacción actualizada
 */
router.put("/:id", authorize("admin", "empleado"), updatePart);

/**
 * @openapi
 * /inventory/{id}:
 *   delete:
 *     summary: Desactivar una refacción (borrado lógico)
 *     tags: [Inventory]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Refacción desactivada
 */
router.delete("/:id", authorize("admin"), deletePart);

export default router;

// Mapea todos los endpoints HTTP del módulo de inventario (/inventory/*).
// Aplica autenticación global para todo el módulo mediante router.use(protect)
// y controla el acceso según el rol de usuario para la creación, edición o eliminación de
// repuestos.
