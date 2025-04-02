import express from "express"
import { createNewCoWorking } from "../controllers/coworking.controller"
import { authorize } from "../middlewares/authorize.middleware"
import { UserRole } from "../models/user.model"
import { protect } from "../middlewares/protect.middleware"

const router = express.Router()

router.post("/", protect , authorize(UserRole.ADMIN), createNewCoWorking)

export default router