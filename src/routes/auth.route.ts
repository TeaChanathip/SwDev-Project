import express from "express"
import { login, logout, register } from "../controllers/auth.controller"
import { validateReqBody } from "../middlewares/validateReqBody.middleware"
import { LoginDTO, RegisterDTO } from "../dtos/auth.dto"

const router = express.Router()

router.post("/register", validateReqBody(RegisterDTO), register)
router.post("/login", validateReqBody(LoginDTO), login)
router.post("/logout", logout)

export default router
