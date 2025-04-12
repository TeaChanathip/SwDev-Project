import express from "express"
import {
    createNewCoWorking,
    deleteCoWorking,
    getAllCoWorkings,
    getOneCoworking,
    updateCoWorking,
} from "../controllers/coworking.controller"
import { authorize } from "../middlewares/authorize.middleware"
import { UserRole } from "../models/user.model"
import { protect } from "../middlewares/protect.middleware"
import roomRouter from "./room.route"
import { validateReqBody } from "../middlewares/validateReqBody.middleware"
import {
    CreateCoWorkingDTO,
    GetAllCoWorkingDTO,
    UpdateCoWorkingDTO,
} from "../dtos/coworking.dto"

const router = express.Router()

router.use("/:coworking_id/rooms", roomRouter)

router.post(
    "/",
    protect,
    authorize(UserRole.ADMIN),
    validateReqBody(CreateCoWorkingDTO),
    createNewCoWorking,
)
router.put(
    "/:id",
    protect,
    authorize(UserRole.ADMIN),
    validateReqBody(UpdateCoWorkingDTO),
    updateCoWorking,
)
router.delete("/:id", protect, authorize(UserRole.ADMIN), deleteCoWorking)
router.get("/", validateReqBody(GetAllCoWorkingDTO), getAllCoWorkings)
router.get("/:id", getOneCoworking)

export default router
