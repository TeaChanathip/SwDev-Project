import express from "express"
import {
    createNewRoom,
    deleteRoom,
    getAllRooms,
    getOneRoom,
    updateRoom,
} from "../controllers/room.controller"
import { authorize } from "../middlewares/authorize.middleware"
import { UserRole } from "../models/user.model"
import { protect } from "../middlewares/protect.middleware"
import reservationRouter from "./reservation.route"
import { validateReqBody } from "../middlewares/validateReqBody.middleware"
import { CreateRoomDTO, GetAllRoomDTO, UpdateRoomDTO } from "../dtos/room.dto"
import { validateQueryParams } from "../middlewares/validateQueryParams.middleware"

const router = express.Router({ mergeParams: true })

router.use("/:room_id/reservations", reservationRouter)

//require coworking id
router.post(
    "/",
    protect,
    authorize(UserRole.ADMIN),
    validateReqBody(CreateRoomDTO),
    createNewRoom,
)
router.put(
    "/:id",
    protect,
    authorize(UserRole.ADMIN),
    validateReqBody(UpdateRoomDTO),
    updateRoom,
)
router.delete("/:id", protect, authorize(UserRole.ADMIN), deleteRoom)

// doesn't require coworking id
router.get("/", validateQueryParams(GetAllRoomDTO), getAllRooms)
router.get("/:id", getOneRoom)

export default router
