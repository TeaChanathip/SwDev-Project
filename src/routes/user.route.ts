import express from "express"
import { protect } from "../middlewares/protect.middleware"
import { authorize } from "../middlewares/authorize.middleware"
import { UserRole } from "../models/user.model"
import { getMe, getOneUser } from "../controllers/user.controller"

const router = express.Router()

router.get("/getMe", protect, getMe)
router.get("/:id", protect, authorize(UserRole.ADMIN), getOneUser)
// router.get("/", protect, authorize(UserRole.ADMIN), )
// router.put("/:id", protect, )
// router.delete("/:id", protect, )

export default router