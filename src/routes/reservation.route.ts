import express from "express"
import {
    createNewReservation,
    deleteReservation,
    getAllReservations,
    getOneReservation,
    updateReservation,
} from "../controllers/reservation.controller"
import { authorize } from "../middlewares/authorize.middleware"
import { UserRole } from "../models/user.model"
import { protect } from "../middlewares/protect.middleware"
import { validateReqBody } from "../middlewares/validateReqBody.middleware"
import {
    CreateReservationDTO,
    GetAllReservationDTO,
    UpdateReservationDTO,
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
router.put(
    "/:id",
    protect,
    validateReqBody(UpdateReservationDTO),
    updateReservation,
)
router.delete("/:id", protect, deleteReservation)

router.get(
    "/",
    protect,
    validateQueryParams(GetAllReservationDTO),
    getAllReservations,
)

router.get("/:id", protect, getOneReservation)

export default router
