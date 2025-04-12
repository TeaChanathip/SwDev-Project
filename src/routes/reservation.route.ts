import express from "express"
import {
    createNewReservation,
    getAllReservations,
} from "../controllers/reservation.controller"
import { authorize } from "../middlewares/authorize.middleware"
import { UserRole } from "../models/user.model"
import { protect } from "../middlewares/protect.middleware"

const router = express.Router({ mergeParams: true })

//require room id
router.post("/", protect, authorize(UserRole.USER), createNewReservation)

router.get(
    "/",
    protect,
    getAllReservations,
)

export default router
