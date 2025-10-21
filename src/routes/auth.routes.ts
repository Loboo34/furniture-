import { Router } from "express";
import { register, login, getUserProfile } from "../controllers/user.controller";
import {schemas, validate} from "../middleware/validator"
import { authenticate } from "../middleware/auth";


const router = Router()


router.post("/register", validate(schemas.register), register)
router.post("/login", validate(schemas.login), login)

router.get("/profile/:id", authenticate, getUserProfile)

export default router