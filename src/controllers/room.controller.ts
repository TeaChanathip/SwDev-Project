import { Request, Response, NextFunction } from "express"
import { CreateRoomDTO, UpdateRoomDTO } from "../dtos/room.dto"
import { validateDto } from "../utils/validateDto"
import { constants } from "http2"
import { RoomModel } from "../models/room.model"
import { plainToInstance } from "class-transformer"
import { CoWorkingModel } from "../models/coworking.model"

const roomModel = new RoomModel()
const coWorkingModel = new CoWorkingModel()

// @desc    Create new room
// @route   POST /api/v1/coworkings/:coworking_id/rooms
// @access  Private
export const createNewRoom = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const coWorkingId = parseInt(req.params.coworking_id)
        if (!coWorkingId) {
            res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                success:false,
                msg: "Invalid usage of createNewRoom"
            })
            return
        }

        const coworkingExists = await coWorkingModel.getCoWorkingByID(coWorkingId)
        if (!coworkingExists) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: `Coworking with id ${coWorkingId} does not exist.`
            })
            return
        }

        const { name, capacity, price } = req.body

        const roomDto = new CreateRoomDTO()
        roomDto.name = name
        roomDto.capacity = capacity
        roomDto.price = price

        // Validate CoworkingDto
        const valErrorMessages = await validateDto(roomDto)
        if (valErrorMessages) {
            res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                msg: valErrorMessages,
            })
            return
        }

        // Create a new coworking in database
        const newRoom = await roomModel.createRoom(
            coWorkingId,
            roomDto
        )
        res.status(constants.HTTP_STATUS_CREATED).json({
            success: true,
            data: newRoom,
        })
    } catch (err) {
        console.error("Error during room creation:", err)
        next(err)
    }
}

// @desc    Update room
// @route   PUT /api/v1/coworkings/:coworking_id/rooms/:id
// @access  Private
export const updateRoom = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const coWorkingId = parseInt(req.params.coworking_id)
        if (!coWorkingId) {
            res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                success:false,
                msg: "Invalid usage of updateRoom"
            })
            return
        }

        const coworkingExists = await coWorkingModel.getCoWorkingByID(coWorkingId)
        if (!coworkingExists) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: `Coworking with id ${coWorkingId} does not exist.`
            })
            return
        }

        const { name, capacity, price } = req.body
        if (!name && !capacity && !price) {
            res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                msg: "All of the inputs cannot be empty.",
            })
            return
        }

        const updateRoomDto = new UpdateRoomDTO()
        updateRoomDto.name = name
        updateRoomDto.capacity = capacity
        updateRoomDto.price = price
        updateRoomDto.updated_at = new Date()

        // Validate updateCoworkingDto
        const valErrorMessages = await validateDto(updateRoomDto)
        if (valErrorMessages) {
            res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                msg: valErrorMessages,
            })
            return
        }

        // Update an existing coworking in database
        const roomId = parseInt(req.params.id)
        const updatedRoom = await roomModel.updateRoomByID(
            roomId,
            coWorkingId,
            updateRoomDto,
        )
        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            data: updatedRoom,
        })
    } catch (err) {
        console.error("Error during room update:", err)
        next(err)
    }
}

// @desc    Delete room
// @route   DELETE /api/v1/coworkings/:coworking_id/rooms/:id
// @access  Private
export const deleteRoom = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const coWorkingId = parseInt(req.params.coworking_id)
        if (!coWorkingId) {
            res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                msg: "Invalid usage of deleteRoom"
            })
            return
        }
        
        const coworkingExists = await coWorkingModel.getCoWorkingByID(coWorkingId)
        if (!coworkingExists) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: `Coworking with id ${coWorkingId} does not exist.`
            })
            return
        }
        
        const roomId = parseInt(req.params.id)
        const deleteRoom =
            await roomModel.deleteRoomByID(roomId,coWorkingId)
        if (!deleteRoom) {
            res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                msg: "Room you are trying to delete does not exist",
            })
            return
        }
        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            data: {},
        })
    } catch (err) {
        console.error("Error during room deletion:", err)
        next(err)
    }
}

// // @desc    Get all coworkings
// // @route   GET /api/v1/coworkings
// // @access  Public
// export const getAllCoWorkings = async (
//     req: Request,
//     res: Response,
//     next: NextFunction,
// ) => {
//     try {
//         const getAllCoWorkingDTO = plainToInstance(
//             GetAllCoWorkingDTO,
//             req.query,
//         )

//         // Validate getCoWorkingDTO
//         const valErrorMessages = await validateDto(getAllCoWorkingDTO)
//         if (valErrorMessages) {
//             res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
//                 success: false,
//                 msg: valErrorMessages,
//             })
//             return
//         }

//         const coWorkings =
//             await coWorkingModel.getAllCoWorkings(getAllCoWorkingDTO)

//         res.status(constants.HTTP_STATUS_OK).json({
//             success: true,
//             data: coWorkings,
//         })
//     } catch (err) {
//         console.error("Error during get all coworkings:", err)
//         next(err)
//     }
// }

// // @desc    Get one coworking
// // @route   GET /api/v1/coworkings/:id
// // @access  Public
// export const getOneCoworking = async (
//     req: Request,
//     res: Response,
//     next: NextFunction,
// ) => {
//     try {
//         const coWorkingId = parseInt(req.params.id)
    
//         const coWorking = await coWorkingModel.getCoWorkingByID(coWorkingId)
//         if (!coWorking) {
//             res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
//                 success: false,
//                 msg: "There is no coworking that matchs with the provided ID"
//             })
//         }

//         res.status(constants.HTTP_STATUS_OK).json({
//             success: true,
//             data: coWorking
//         })
//     } catch (err) {
//         console.error("Error during get one coworking:", err)
//         next(err)
//     }
// }
