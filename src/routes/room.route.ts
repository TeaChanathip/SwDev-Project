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

const router = express.Router({ mergeParams: true })

//require coworking id
router.post("/", protect, authorize(UserRole.ADMIN), createNewRoom)
router.put("/:id", protect, authorize(UserRole.ADMIN), updateRoom)
router.delete("/:id", protect, authorize(UserRole.ADMIN), deleteRoom)

router.get("/", getAllRooms)
router.get("/:id", getOneRoom)

export default router
