import { Router } from "express";
import {
  getOrCreateOrder,
  getOrderById,
  updateOrderDetails,
  addOrderPart,
  removeOrderPart,
  closeOrder,
} from "../controllers/serviceOrderController.js";
import { protect } from "../middlewares/protect.js";

const router = Router();

router.use(protect);

router.get("/reception/:receptionId", getOrCreateOrder);
router.get("/:id", getOrderById);
router.put("/:id", updateOrderDetails);
router.post("/:id/parts", addOrderPart);
router.delete("/:id/parts/:partLineId", removeOrderPart);
router.post("/:id/close", closeOrder);

export default router;
