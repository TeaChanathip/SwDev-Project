import express from "express"
import { login, logout, register } from "../controllers/auth.controller"
import { protect } from "../middlewares/protect.middleware"

const router = express.Router()

router.post("/register", protect, register)
router.post("/login", login)
router.post("/logout", protect, logout)

export default router
