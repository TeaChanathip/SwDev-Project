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

const router = express.Router()

router.use("/:coworking_id/rooms", roomRouter)

router.post("/", protect, authorize(UserRole.ADMIN), createNewCoWorking)
router.put("/:id", protect, authorize(UserRole.ADMIN), updateCoWorking)
router.delete("/:id", protect, authorize(UserRole.ADMIN), deleteCoWorking)
router.get("/", getAllCoWorkings)
router.get("/:id", getOneCoworking)

export default router
