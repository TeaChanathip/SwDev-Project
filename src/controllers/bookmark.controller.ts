import { Response, NextFunction } from "express"
import { PaginationDTO } from "../dtos/pagination.dto"
import { constants } from "http2"
import { BookmarkModel } from "../models/bookmark.model"
import { plainToInstance } from "class-transformer"
import { RoomModel } from "../models/room.model"
import { RequestWithUser } from "../interfaces/RequestWithUser.interface"

const roomModel = new RoomModel()
const bookmarkModel = new BookmarkModel()

// @desc    Create new bookmark
// @route   POST /api/v1/rooms/:room_id/bookmarks
// @access  Private
export const createNewBookmark = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
) => {
    try {
        // The route is protected by middleware, so we can assure that "user" is defined
        const userId = req.user!.id
        const roomId = parseInt(req.params.room_id)
        console.log(roomId)

        if (Number.isNaN(roomId)) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: "Room with the provided ID does not exist.",
            })
            return
        }

        const roomExists = await roomModel.getRoomByID(roomId)
        if (!roomExists) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: `Room with id ${roomId} does not exist.`,
            })
            return
        }
        const bookmarkExists = await bookmarkModel.getBookmark(userId, roomId)
        if (bookmarkExists) {
            res.status(constants.HTTP_STATUS_CONFLICT).json({
                success: false,
                msg: "Bookmark already exists",
            })
            return
        }
        // Create a new coworking in database
        const newBookmark = await bookmarkModel.createBookmark(userId, roomId)
        res.status(constants.HTTP_STATUS_CREATED).json({
            success: true,
            data: newBookmark,
        })
    } catch (err) {
        console.error("Error during bookmark creation:", err)
        next(err)
    }
}

// @desc    Delete bookmark
// @route   DELETE /api/v1/rooms/:room_id/bookmarks
// @access  Private
export const deleteBookmark = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = req.user!.id
        const roomId = parseInt(req.params.room_id)

        if (Number.isNaN(roomId)) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: "Room with the provided ID does not exist.",
            })
            return
        }

        const roomExists = await roomModel.getRoomByID(roomId)
        if (!roomExists) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: `Room with id ${roomId} does not exist.`,
            })
            return
        }
        // Create a new coworking in database
        const deleteBookmark = await bookmarkModel.deleteBookmark(
            userId,
            roomId,
        )
        if (!deleteBookmark) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: "Bookmark you are trying to delete does not exist",
            })
            return
        }
        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            data: {},
        })
    } catch (err) {
        console.error("Error during bookmark deletion:", err)
        next(err)
    }
}

// @desc    Get all bookmarks
// @route   GET /api/v1/bookmarks
// @access  Private
export const getAllBookmarks = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
) => {
    try {
        const paginationDTO = plainToInstance(PaginationDTO, req.query)

        const coWorkings = await bookmarkModel.getAllBookmarks(paginationDTO)

        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            data: coWorkings,
        })
    } catch (err) {
        console.error("Error during get all bookmarks:", err)
        next(err)
    }
}

// @desc    Get one bookmark
// @route   GET /api/v1/bookmarks/:room_id
// @access  Private
export const getOneBookmark = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = req.user!.id
        const roomId = parseInt(req.params.room_id)
        if (Number.isNaN(roomId)) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: "Room with the provided ID does not exist.",
            })
            return
        }

        const roomExists = await roomModel.getRoomByID(roomId)
        if (!roomExists) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: `Room with id ${roomId} does not exist.`,
            })
            return
        }
        const bookmark = await bookmarkModel.getBookmark(userId, roomId)
        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            data: bookmark,
        })
    } catch (err) {
        console.error("Error during get one bookmark:", err)
        next(err)
    }
}
