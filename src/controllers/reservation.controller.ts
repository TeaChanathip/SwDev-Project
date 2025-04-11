import { Request, Response, NextFunction } from "express"
import {
    CreateReservationDTO
} from "../dtos/reservation.dto"
import { validateDto } from "../utils/validateDto"
import { constants } from "http2"
import { UserModel } from "../models/user.model"
import { RoomModel } from "../models/room.model"
import { ReservationModel } from "../models/reservation.model"
import { plainToInstance } from "class-transformer"
import { RequestWithUser } from "../interfaces/RequestWithUser.interface"

const userModel = new UserModel()
const roomModel = new RoomModel()
const reservationModel = new ReservationModel()

// @desc    Create new reservation
// @route   POST /api/v1/rooms/:room_id/reservations
// @access  Private
export const createNewReservation = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
) => {
    try {
        const roomId = parseInt(req.params.room_id)
        if (!roomId) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: `Room with id ${roomId} does not exist.`,
            })
            return
        }

        const roomExists =
            await roomModel.getRoomByID(roomId)
        if (!roomExists) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: `Coworking with id ${roomId} does not exist.`,
            })
            return
        }

        const reservationDto = plainToInstance(CreateReservationDTO, req.body)
        reservationDto.room_id = roomId
        reservationDto.owner_id = req.user?.id

        // Validate reservationDto
        const valErrorMessages = await validateDto(reservationDto)
        if (valErrorMessages) {
            res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                msg: valErrorMessages,
            })
            return
        }

        // Create a new reservation in database
        const newReservation = await reservationModel.createReservation(reservationDto)
        res.status(constants.HTTP_STATUS_CREATED).json({
            success: true,
            data: newReservation,
        })
    } catch (err) {
        console.error("Error during reservation creation:", err)
        next(err)
    }
}