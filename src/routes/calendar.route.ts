import express from "express"
import { protect } from "../middlewares/protect.middleware"
import { authorize } from "../middlewares/authorize.middleware"
import { UserRole } from "../models/user.model"

const router = express.Router()

// router.get("/", protect, authorize(UserRole.USER), )

export default router