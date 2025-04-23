import express from "express"
import { protect } from "../middlewares/protect.middleware"
import { authorize } from "../middlewares/authorize.middleware"
import { UserRole } from "../models/user.model"
import { getICalendar } from "../controllers/calendar.controller"

const router = express.Router()

router.get("/", protect, authorize(UserRole.USER), getICalendar)

export default router