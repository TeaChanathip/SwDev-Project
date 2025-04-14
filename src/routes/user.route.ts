import express from "express"
import { protect } from "../middlewares/protect.middleware"
import { authorize } from "../middlewares/authorize.middleware"
import { UserRole } from "../models/user.model"
import {
    getAllUsers,
    getMe,
    getOneUser,
    updateMe,
} from "../controllers/user.controller"
import { validateQueryParams } from "../middlewares/validateQueryParams.middleware"
import { GetAllUsersDTO, UpdateUserDTO } from "../dtos/user.dto"
import { validateReqBody } from "../middlewares/validateReqBody.middleware"

const router = express.Router()

router.get("/me", protect, getMe)
router.get("/:id", protect, authorize(UserRole.ADMIN), getOneUser)
router.get(
    "/",
    protect,
    authorize(UserRole.ADMIN),
    validateQueryParams(GetAllUsersDTO),
    getAllUsers,
)
router.put(
    "/me",
    protect,
    authorize(UserRole.USER),
    validateReqBody(UpdateUserDTO),
    updateMe,
)
// router.delete("/:id", protect, )

export default router
