import { Router } from "express";
import { createMotorcycle } from "../controllers/motorcycleController.js";
import { protect } from "../middlewares/protect.js";

const router = Router();

router.use(protect);

router.post("/", createMotorcycle);

export default router;
