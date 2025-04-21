import express from "express"
import {
    createNewInvitation,
    getAllInvitations,
    getAllInvitationsToMe,
} from "../controllers/invitation.controller"
import { protect } from "../middlewares/protect.middleware"
import { authorize } from "../middlewares/authorize.middleware"
import { UserRole } from "../models/user.model"
import { validateReqBody } from "../middlewares/validateReqBody.middleware"
import {
    CreateInvitationsDTO,
    GetAllInvitationsDTO,
} from "../dtos/invitation.dto"
import { validateQueryParams } from "../middlewares/validateQueryParams.middleware"

const router = express.Router({ mergeParams: true })

router.post(
    "/",
    protect,
    authorize(UserRole.USER),
    validateReqBody(CreateInvitationsDTO),
    createNewInvitation,
)
router.get(
    "/",
    protect,
    validateQueryParams(GetAllInvitationsDTO),
    getAllInvitations,
)
router.get(
    "/to-me",
    protect,
    authorize(UserRole.USER),
    validateQueryParams(GetAllInvitationsDTO),
    getAllInvitationsToMe,
)
// router.get("/")
// router.delete("/:id")

// router.post("/:id/accept")

export default router
