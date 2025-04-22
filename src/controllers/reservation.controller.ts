import { Response, NextFunction } from "express"
import {
    CreateReservationDTO,
    GetAllReservationDTO,
    UpdateReservationDTO,
} from "../dtos/reservation.dto"
import { constants } from "http2"
import { UserModel, UserRole } from "../models/user.model"
import { RoomModel } from "../models/room.model"
import { Reservation, ReservationModel } from "../models/reservation.model"
import { plainToInstance } from "class-transformer"
import { RequestWithUser } from "../interfaces/RequestWithUser.interface"
import { CoWorkingModel } from "../models/coworking.model"
import { getTimeFromDate } from "../utils/getTimeFromDate"

const userModel = new UserModel()
const coWorkingModel = new CoWorkingModel()
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

        if (!req.params.room_id) {
            res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                msg: "Room id is not provided",
            })
            return
        }

        const roomId = parseInt(req.params.room_id)

        if (Number.isNaN(roomId)) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: "Room with the provided ID does not exist.",
            })
            return
        }

        const roomExists = await roomModel.getRoomById(roomId)
        if (!roomExists) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: `Room with id ${roomId} does not exist.`,
            })
            return
        }

        const reservationDto = plainToInstance(CreateReservationDTO, req.body)

        // Check if the coworking is open at the prefered time
        const coWorkingId = roomExists.coworking_id
        const coWorking = await coWorkingModel.getCoWorkingById(coWorkingId)
        const start_time = getTimeFromDate(reservationDto.start_at)
        const end_time = getTimeFromDate(reservationDto.end_at)
        if (
            start_time <= coWorking!.open_time ||
            end_time >= coWorking!.close_time
        ) {
            res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                msg:
                    "The reservation time must be within the coworking space's operating hours: " +
                    `${coWorking!.open_time} to ${coWorking!.close_time}.`,
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
            owner_id: userId,
            end_after: new Date(),
        })
        if (checkExistingAmount.length >= 3) {
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

// @desc    Update reservation this person has access to
// @route   PUT /api/v1/reservations/:id
// @route   PUT /api/v1/rooms/:room_id/reservations/:id
// @access  Private
export const updateReservation = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userRole = req.user!.role
        const userId = req.user!.id
        const reservationId = parseInt(req.params.id)

        //Invalid format of id
        if (Number.isNaN(reservationId)) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: "There is no reservation that matchs with the provided ID",
            })
            return
        }

        let roomId: number = 0
        //Access via rooms/:room_id/reservations/:id
        if (req.params.room_id) {
            roomId = parseInt(req.params.room_id)
            if (Number.isNaN(roomId)) {
                res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                    success: false,
                    msg: "Room with the provided ID does not exist.",
                })
                return
            }

            const roomExists = await roomModel.getRoomById(roomId)
            if (!roomExists) {
                res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                    success: false,
                    msg: `Room with id ${roomId} does not exist.`,
                })
                return
            }
        }

        const reservationExists = await reservationModel.getReservationById(
            reservationId,
            req.params.room_id ? roomId : undefined,
        )
        if (
            !reservationExists ||
            (userRole === UserRole.USER &&
                reservationExists.owner_id !== userId)
        ) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: "No reservation that matchs with the provided ID(s) or in your possession",
            })
            return
        }

        const updateReservationDto = plainToInstance(
            UpdateReservationDTO,
            req.body,
        )
        updateReservationDto.updated_at = new Date()

        // Check if there are any overlapping reservations
        const overlappingReservations =
            await reservationModel.getAllReservations(
                {
                    start_before: updateReservationDto.end_at,
                    end_after: updateReservationDto.start_at,
                },
                roomId,
            )
        if (
            overlappingReservations.filter(
                (reservation) => reservation.id != reservationId,
            ).length > 0
        ) {
            res.status(constants.HTTP_STATUS_CONFLICT).json({
                success: false,
                msg: "The room is already reserved during the specified time.",
            })
            return
        }

        const updatedReservation = await reservationModel.updateReservationById(
            updateReservationDto,
            reservationId,
            roomId,
        )
        if (!updatedReservation) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: "Reservation you are trying to update does not exist",
            })
            return
        }

        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            data: updatedReservation,
        })
    } catch (err) {
        console.error("Error during reservation update:", err)
        next(err)
    }
}

// @desc    Delete reservation
// @route   DELETE /api/v1/reservations/:id
// @route   DELETE /api/v1/rooms/:room_id/reservations/:id
// @access  Private
export const deleteReservation = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userRole = req.user!.role
        const userId = req.user!.id
        const reservationId = parseInt(req.params.id)

        //Invalid format of id
        if (Number.isNaN(reservationId)) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: "There is no reservation that matchs with the provided ID",
            })
            return
        }

        let roomId: number = 0
        //Access via rooms/:room_id/reservations/:id
        if (req.params.room_id) {
            roomId = parseInt(req.params.room_id)
            if (Number.isNaN(roomId)) {
                res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                    success: false,
                    msg: "Room with the provided ID does not exist.",
                })
                return
            }

            const roomExists = await roomModel.getRoomById(roomId)
            if (!roomExists) {
                res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                    success: false,
                    msg: `Room with id ${roomId} does not exist.`,
                })
                return
            }
        }

        const reservationExists = await reservationModel.getReservationById(
            reservationId,
            req.params.room_id ? roomId : undefined,
        )
        if (
            !reservationExists ||
            (userRole === UserRole.USER &&
                reservationExists.owner_id !== userId)
        ) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: "No reservation that matchs with the provided ID(s) or in your possession",
            })
            return
        }

        const deleteReservation = await reservationModel.deleteReservationById(
            reservationId,
            roomId,
        )
        if (!deleteReservation) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: "Reservation you are trying to delete does not exist",
            })
            return
        }
        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            data: {},
        })
    } catch (err) {
        console.error("Error during reservation deletion:", err)
        next(err)
    }
}

// @desc    Get all reservations this person has access to
// @route   GET /api/v1/reservations
// @route   GET /api/v1/rooms/:room_id/reservations
// @access  Private
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
        if (req.query.owner_id) {
            if (userRole !== UserRole.ADMIN) {
                res.status(constants.HTTP_STATUS_FORBIDDEN).json({
                    success: false,
                    msg: "You do not have the permission to check other user's reservation.",
                })
                return
            }

            const ownerId = parseInt(req.query.owner_id as string)
            if (Number.isNaN(ownerId)) {
                res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                    success: false,
                    msg: `User with id ${ownerId} does not exist.`,
                })
                return
            }

            const userExists = await userModel.getUserById(ownerId)
            if (!userExists) {
                res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                    success: false,
                    msg: `User with id ${ownerId} does not exist.`,
                })
                return
            }

            getAllReservationDTO.owner_id = ownerId
        }
        if (userRole === UserRole.USER) {
            getAllReservationDTO.owner_id = req.user!.id
        }

        let reservations: Reservation[]
        let roomId: number = 0

        if (req.params.room_id) {
            roomId = parseInt(req.params.room_id)
            if (Number.isNaN(roomId)) {
                res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                    success: false,
                    msg: `Room with id ${roomId} does not exist.`,
                })
                return
            }

            const roomExists = await roomModel.getRoomById(roomId)
            if (!roomExists) {
                res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                    success: false,
                    msg: `Room with id ${roomId} does not exist.`,
                })
                return
            }
        }
        reservations = await reservationModel.getAllReservations(
            getAllReservationDTO,
            req.params.room_id ? roomId : undefined,
        )

        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            data: reservations,
        })
    } catch (err) {
        console.error("Error during get all reservations:", err)
        next(err)
    }
}

// @desc    Get one reservation
// @route   GET /api/v1/reservations/:id
// @route   GET /api/v1/rooms/:room_id/reservations/:id
// @access  Private
export const getOneReservation = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
) => {
    try {
        const reservationId = parseInt(req.params.id)
        const userRole = req.user!.role
        const userId = req.user!.id
        if (Number.isNaN(reservationId)) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: "No reservation that matchs with the provided ID(s) or in your possession",
            })
            return
        }

        let reservation: Reservation | null
        let roomId: number = 0
        //Access via rooms/:room_id/reservations/:id
        if (req.params.room_id) {
            roomId = parseInt(req.params.room_id)
            if (Number.isNaN(roomId)) {
                res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                    success: false,
                    msg: `Room with id ${roomId} does not exist.`,
                })
                return
            }

            const roomExists = await roomModel.getRoomById(roomId)
            if (!roomExists) {
                res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                    success: false,
                    msg: `Room with id ${roomId} does not exist.`,
                })
                return
            }
        }
        reservation = await reservationModel.getReservationById(
            reservationId,
            req.params.room_id ? roomId : undefined,
        )

        if (
            !reservation ||
            (userRole === UserRole.USER && reservation.owner_id !== userId)
        ) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: "No reservation that matchs with the provided ID(s) or in your possession",
            })
            return
        }

        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            data: reservation,
        })
    } catch (err) {
        console.error("Error during get one of your reservation:", err)
        next(err)
    }
}
