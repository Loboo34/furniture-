import { Router } from "express";

import { addToCart, updateCart, removeItem, getItems } from "../controllers/cart.controller";
import { validate, schemas } from "../middleware/validator";
import { authenticate } from "../middleware/auth";

const router = Router()


router.get("/", getItems)
router.post("/", authenticate, validate(schemas.addToCart), addToCart)
router.put("/:id", authenticate,  updateCart)
router.delete("/:id", removeItem)


export default router