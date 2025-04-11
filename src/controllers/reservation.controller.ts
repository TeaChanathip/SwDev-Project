import { Request, Response, NextFunction, response } from "express"
import {
    CreateReservationDTO,
    GetAllReservationDTO,
} from "../dtos/reservation.dto"
import { validateDto } from "../utils/validateDto"
import { constants } from "http2"
import { UserModel, UserRole } from "../models/user.model"
import { RoomModel } from "../models/room.model"
import { Reservation, ReservationModel } from "../models/reservation.model"
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
        // The route is protected by middleware, so we can assure that "user" is defined
        const userId = req.user!.id
        const roomId = parseInt(req.params.room_id)

        if (Number.isNaN(roomId)) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: `Room with id ${roomId} does not exist.`,
            })
            return
        }

        const roomExists = await roomModel.getRoomByID(roomId)
        if (!roomExists) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: `Coworking with id ${roomId} does not exist.`,
            })
            return
        }

        const reservationDto = plainToInstance(CreateReservationDTO, req.body)

        // Validate reservationDto
        const valErrorMessages = await validateDto(reservationDto)
        if (valErrorMessages) {
            res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                msg: valErrorMessages,
            })
            return
        }

        // Check if there are any overlapping reservations
        const overlappingReservations =
            await reservationModel.getAllReservations(
                {
                    start_before: reservationDto.end_at,
                    end_after: reservationDto.start_at,
                },
                roomId,
            )
        if (overlappingReservations.length > 0) {
            res.status(constants.HTTP_STATUS_CONFLICT).json({
                success: false,
                msg: "The room is already reserved during the specified time.",
            })
            return
        }

        // Check if number of reservations already reached the limit
        const checkExistingAmount = await reservationModel.getAllReservations({
            user_id: userId,
            end_after: new Date(),
        })
        if (checkExistingAmount.length >= 3) {
            console.log(checkExistingAmount.length)
            res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                msg: "You can have at most 3 active reservations.",
            })
            return
        }

        // Create a new reservation in database
        const newReservation = await reservationModel.createReservation(
            reservationDto,
            userId,
            roomId,
        )
        res.status(constants.HTTP_STATUS_CREATED).json({
            success: true,
            data: newReservation,
        })
    } catch (err) {
        console.error("Error during reservation creation:", err)
        next(err)
    }
}

// @desc    Get all reservations this person has access to
// @route   GET /api/v1/reservations
// @route   GET /api/v1/rooms/:room_id/reservations
// @access  Public
export const getAllReservations = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userRole = req.user!.role
        const getAllReservationDTO = plainToInstance(
            GetAllReservationDTO,
            req.query,
        )
        if (req.query.user_id) {
            if (userRole !== UserRole.ADMIN) {
                res.status(constants.HTTP_STATUS_FORBIDDEN).json({
                    success: false,
                    msg: "You do not have the permission to check other user's reservation.",
                })
                return
            }

            const userId = parseInt(req.query.user_id as string)
            if (Number.isNaN(userId)) {
                res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                    success: false,
                    msg: `User with id ${userId} does not exist.`,
                })
                return
            }

            const userExists = await userModel.getUserById(userId)
            if (!userExists) {
                res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                    success: false,
                    msg: `User with id ${userId} does not exist.`,
                })
                return
            }

            getAllReservationDTO.user_id = userId
        }
        if (userRole === UserRole.USER) {
            getAllReservationDTO.user_id = req.user?.id
        }

        // Validate getAllReservationDTO
        const valErrorMessages = await validateDto(getAllReservationDTO)
        if (valErrorMessages) {
            res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                msg: valErrorMessages,
            })
            return
        }

        let reservations: Reservation[]

        if (req.params.room_id) {
            const roomId = parseInt(req.params.room_id)
            if (Number.isNaN(roomId)) {
                res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                    success: false,
                    msg: `Room with id ${roomId} does not exist.`,
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

            reservations = await reservationModel.getAllReservations(
                getAllReservationDTO,
                roomId,
            )
        } else {
            reservations =
                await reservationModel.getAllReservations(getAllReservationDTO)
        }

        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            data: reservations,
        })
    } catch (err) {
        console.error("Error during get all reservations:", err)
        next(err)
    }
}
