import { Router } from "express";
import {
  createReception,
  getReceptions,
  getReceptionById,
  updateReceptionStatus,
} from "../controllers/receptionController.js";
import { protect } from "../middlewares/protect.js";

const router = Router();

router.use(protect);

router.get("/", getReceptions);
router.get("/:id", getReceptionById);
router.post("/", createReception);
router.patch("/:id/status", updateReceptionStatus);

export default router;

//
