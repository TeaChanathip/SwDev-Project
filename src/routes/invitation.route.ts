import express from "express"
import { createNewInvitation } from "../controllers/invitation.controller"
import { protect } from "../middlewares/protect.middleware"
import { authorize } from "../middlewares/authorize.middleware"
import { UserRole } from "../models/user.model"
import { validateReqBody } from "../middlewares/validateReqBody.middleware"
import { CreateInvitationDTO } from "../dtos/invitation.dto"

const router = express.Router({ mergeParams: true })

router.post(
    "/",
    protect,
    authorize(UserRole.USER),
    validateReqBody(CreateInvitationDTO),
    createNewInvitation,
)
// router.get("/:id")
// router.get("/")
// router.delete("/:id")

// router.post("/:id/accept")

export default router
