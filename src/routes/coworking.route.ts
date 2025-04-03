import express from "express"
import {
    createNewCoWorking,
    deleteCoWorking,
    updateCoWorking,
} from "../controllers/coworking.controller"
import { authorize } from "../middlewares/authorize.middleware"
import { UserRole } from "../models/user.model"
import { protect } from "../middlewares/protect.middleware"

const router = express.Router()

router.post("/", protect, authorize(UserRole.ADMIN), createNewCoWorking)
router.put("/:id", protect, authorize(UserRole.ADMIN), updateCoWorking)
router.delete("/:id", protect, authorize(UserRole.ADMIN), deleteCoWorking)

export default router
