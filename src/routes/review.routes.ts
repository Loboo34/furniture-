import { Router } from "express";

import { leaveReview,  getReviewsByProduct } from "../controllers/review.controller";
import { validate, schemas } from "../middleware/validator";


const router = Router()

router.post("/", validate(schemas.leaveReview), leaveReview)
router.get("/:id", getReviewsByProduct)

export default router