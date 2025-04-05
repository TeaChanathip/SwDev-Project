import { Request, Response, NextFunction } from "express"
import { CreateRoomDTO } from "../dtos/room.dto"
import { validateDto } from "../utils/validateDto"
import { constants } from "http2"
import { RoomModel } from "../models/room.model"
import { plainToInstance } from "class-transformer"

const roomModel = new RoomModel()

// @desc    Create new room
// @route   POST /api/v1/coworkings/:coworking_id/rooms
// @access  Private
export const createNewRoom = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const coworking_id = parseInt(req.params.coworking_id)
        if (!coworking_id || coworking_id === null) {
            res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                success:false,
                msg: "Invalid usage of createNewRoom"
            })
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
            coworking_id,
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

// // @desc    Update room
// // @route   PUT /api/v1/coworkings/rooms/:id
// // @access  Private
// export const updateCoWorking = async (
//     req: Request,
//     res: Response,
//     next: NextFunction,
// ) => {
//     try {
//         const { name, phone, open_time, close_time } = req.body
//         if (!name && !phone && !open_time && !close_time) {
//             res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
//                 success: false,
//                 msg: "All of the inputs cannot be empty.",
//             })
//             return
//         }
//         //close_time and open_time must be presented if any present
//         if ((open_time && !close_time) || (!open_time && close_time)) {
//             res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
//                 success: false,
//                 msg: "Open time and close time must both be present if any is present.",
//             })
//             return
//         }

//         const updateCoWorkingDto = new UpdateCoWorkingDTO()
//         updateCoWorkingDto.name = name
//         updateCoWorkingDto.phone = phone
//         updateCoWorkingDto.open_time = open_time
//         updateCoWorkingDto.close_time = close_time
//         updateCoWorkingDto.updated_at = new Date()

//         // Validate updateCoworkingDto
//         const valErrorMessages = await validateDto(updateCoWorkingDto)
//         if (valErrorMessages) {
//             res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
//                 success: false,
//                 msg: valErrorMessages,
//             })
//             return
//         }

//         // Update an existing coworking in database
//         const coWorkingId = parseInt(req.params.id)
//         const updatedCoWorking = await coWorkingModel.updateCoWorkingByID(
//             coWorkingId,
//             updateCoWorkingDto,
//         )
//         res.status(constants.HTTP_STATUS_OK).json({
//             success: true,
//             data: updatedCoWorking,
//         })
//     } catch (err) {
//         console.error("Error during coworking creation:", err)
//         next(err)
//     }
// }

// // @desc    Delete coworking
// // @route   DELETE /api/v1/coworkings/:id
// // @access  Private
// export const deleteCoWorking = async (
//     req: Request,
//     res: Response,
//     next: NextFunction,
// ) => {
//     try {
//         const coworkingId = parseInt(req.params.id)
//         const deleteCoWorking =
//             await coWorkingModel.deleteCoWorkingByID(coworkingId)
//         if (!deleteCoWorking) {
//             res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
//                 success: false,
//                 msg: "Coworking you are trying to delete does not exist",
//             })
//             return
//         }
//         res.status(constants.HTTP_STATUS_OK).json({
//             success: true,
//             data: {},
//         })
//     } catch (err) {
//         console.error("Error during coworking deletion:", err)
//         next(err)
//     }
// }

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
