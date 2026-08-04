import { Router } from "express";
import {
  searchCustomers,
  createCustomer,
  getCustomerMotorcycles,
} from "../controllers/customerController.js";
import { protect } from "../middlewares/protect.js";

const router = Router();

router.use(protect);

router.get("/", searchCustomers);
router.post("/", createCustomer);
router.get("/:id/motorcycles", getCustomerMotorcycles);

export default router;

//
