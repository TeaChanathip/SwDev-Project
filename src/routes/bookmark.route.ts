import express from "express"
import {
    createNewBookmark,
    deleteBookmark,
    getOneBookmark,
    getAllBookmarks,
} from "../controllers/bookmark.controller"
import { authorize } from "../middlewares/authorize.middleware"
import { UserRole } from "../models/user.model"
import { protect } from "../middlewares/protect.middleware"
import { PaginationDTO } from "../dtos/pagination.dto"
import { validateQueryParams } from "../middlewares/validateQueryParams.middleware"

const router = express.Router({ mergeParams: true })

//access via /rooms/:room_id/bookmarks
router.post("/", protect, authorize(UserRole.USER), createNewBookmark)

router.delete("/", protect, authorize(UserRole.USER), deleteBookmark)

//access via /bookmarks/:room_id
router.get(
    "/",
    protect,
    authorize(UserRole.USER),
    validateQueryParams(PaginationDTO),
    getAllBookmarks,
)

router.get("/:room_id", protect, authorize(UserRole.USER), getOneBookmark)

export default router
