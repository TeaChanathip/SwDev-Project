import express from "express"
import {
    createNewReservation,
    getAllReservations,
} from "../controllers/reservation.controller"
import { authorize } from "../middlewares/authorize.middleware"
import { UserRole } from "../models/user.model"
import { protect } from "../middlewares/protect.middleware"
import { validateReqBody } from "../middlewares/validateReqBody.middleware"
import {
    CreateReservationDTO,
    GetAllReservationDTO,
} from "../dtos/reservation.dto"
import { validateQueryParams } from "../middlewares/validateQueryParams.middleware"

const router = express.Router({ mergeParams: true })

//require room id
router.post(
    "/",
    protect,
    authorize(UserRole.USER),
    validateReqBody(CreateReservationDTO),
    createNewReservation,
)

router.get(
    "/",
    protect,
    validateQueryParams(GetAllReservationDTO),
    getAllReservations,
)

export default router
