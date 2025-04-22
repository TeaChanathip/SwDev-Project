import express from "express"
import {
    createNewInvitation,
    deleteInvitation,
    getAllInvitations,
    getAllInvitationsToMe,
    responseToInvitation,
} from "../controllers/invitation.controller"
import { protect } from "../middlewares/protect.middleware"
import { authorize } from "../middlewares/authorize.middleware"
import { UserRole } from "../models/user.model"
import { validateReqBody } from "../middlewares/validateReqBody.middleware"
import {
    CreateInvitationsDTO,
    DeleteInvitationDTO,
    GetAllInvitationsDTO,
} from "../dtos/invitation.dto"
import { validateQueryParams } from "../middlewares/validateQueryParams.middleware"
import { InvitationStatus } from "../models/invitation.model"

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
router.delete(
    "/",
    protect,
    validateQueryParams(DeleteInvitationDTO),
    deleteInvitation,
)

// Use GET to be able to open in browser
// The link with token should be sent to the user via email
// But it's not in the requirement
router.get(
    "/accept/:token",
    responseToInvitation(InvitationStatus.ACCEPTED),
)
router.get(
    "/reject/:token",
    responseToInvitation(InvitationStatus.REJECTED),
)

export default router
