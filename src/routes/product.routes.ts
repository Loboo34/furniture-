import { Router } from "express";

import {
	addProduct,
	updateProduct,
	deleteProduct,
	getProducts,
	getProduct,
	updateStock,
	getListingsBySeller
} from "../controllers/product.controller";
import { validateWithFile, schemas } from "../middleware/validator";
import { multerUpload } from "../middleware/multer";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/",  getProducts);
router.get("/:id", getProduct);
router.get("/listing/:id", getListingsBySeller)


router.post(
	"/",
	authenticate,
	multerUpload.single("image"),
	validateWithFile(schemas.addProduct, false),
	addProduct
);

router.put(
	"/id",
	authenticate,
	multerUpload.single("image"),
	validateWithFile(schemas.updateProduct),
	updateProduct
);

router.put("/:id", updateStock)
router.delete("/:id", authenticate, deleteProduct)

export default router