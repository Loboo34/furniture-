import { Router } from "express";

import { makeOrder, getBuyersOrders, getSellersOrders, updateStatus, cancelOrder } from "../controllers/order.controller";
import {validate, schemas} from "../middleware/validator"
import { authenticate } from "../middleware/auth";



const router = Router()

router.get("/buyer/:id", authenticate, getBuyersOrders)
router.get("/seller/:id", authenticate, getSellersOrders)

router.post("/", validate(schemas.makeOrder), makeOrder)
router.put("/:id", updateStatus)
router.put("/cancel/:id", authenticate, cancelOrder)

export default router