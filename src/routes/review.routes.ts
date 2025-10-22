import { Router } from "express";
import {
	leaveReview,
	getReviews,
	getReviewsByProduct,
	getReviewsBySeller,
} from "../controllers/review.controller";
import { authenticate } from "../middleware/auth";
import { validate, schemas } from "../middleware/validator";

const router = Router();


router.get("/seller/:sellerId", getReviewsBySeller);

router.post("/", authenticate, validate(schemas.leaveReview), leaveReview);
router.get("/:id", getReviewsByProduct);

export default router;
