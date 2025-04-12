import express from "express"
import { login, logout, register } from "../controllers/auth.controller"
import { validateReqBody } from "../middlewares/validateReqBody.middleware"
import { LoginDTO } from "../dtos/auth.dto"

const router = express.Router()

router.post("/register", register)
router.post("/login", validateReqBody(LoginDTO), login)
router.post("/logout", logout)

export default router
