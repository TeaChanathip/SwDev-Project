import { Request, Response, NextFunction } from "express"
import { CreateRoomDTO, GetAllRoomDTO, UpdateRoomDTO } from "../dtos/room.dto"
import { constants } from "http2"
import { Room, RoomModel } from "../models/room.model"
import { plainToInstance } from "class-transformer"
import { CoWorking, CoWorkingModel } from "../models/coworking.model"
import { ReservationModel } from "../models/reservation.model"
import { GetAllReservationDTO } from "../dtos/reservation.dto"

const roomModel = new RoomModel()
const coWorkingModel = new CoWorkingModel()
const reservationModel = new ReservationModel()

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
        if (Number.isNaN(coWorkingId)) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: `Coworking with id ${coWorkingId} does not exist.`,
            })
            return
        }

        const coworkingExists =
            await coWorkingModel.getCoWorkingByID(coWorkingId)
        if (!coworkingExists) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: `Coworking with id ${coWorkingId} does not exist.`,
            })
            return
        }

        const roomDto = plainToInstance(CreateRoomDTO, req.body)

        // Create a new coworking in database
        const newRoom = await roomModel.createRoom(coWorkingId, roomDto)
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
        const roomId = parseInt(req.params.id)

        // coWorkingId might be NaN
        if (Number.isNaN(coWorkingId)) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: "There is no coworking that matchs with the provided ID",
            })
            return
        }
        // roomId might be NaN
        if (Number.isNaN(roomId)) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: "There is no room that matchs with the provided ID",
            })
            return
        }

        const coworkingExists =
            await coWorkingModel.getCoWorkingByID(coWorkingId)
        if (!coworkingExists) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: `Coworking with id ${coWorkingId} does not exist.`,
            })
            return
        }

        //Check if room exists
        const roomExists = await roomModel.getRoomByID(roomId)
        if (!roomExists) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: `Room with id ${roomId} does not exist.`,
            })
            return
        }

        // Update an existing coworking in database
        const updateRoomDto = plainToInstance(UpdateRoomDTO, req.body)
        updateRoomDto.updated_at = new Date()

        const updatedRoom = await roomModel.updateRoomByID(
            updateRoomDto,
            roomId,
            coWorkingId,
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
        const roomId = parseInt(req.params.id)

        // coWorkingId might be NaN
        if (Number.isNaN(coWorkingId)) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: "There is no coworking that matchs with the provided ID",
            })
            return
        }
        // roomId might be NaN
        if (Number.isNaN(roomId)) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: "There is no room that matchs with the provided ID",
            })
            return
        }

        const coworkingExists =
            await coWorkingModel.getCoWorkingByID(coWorkingId)
        if (!coworkingExists) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: `Coworking with id ${coWorkingId} does not exist.`,
            })
            return
        }

        //check if room exists
        const roomExists = await roomModel.getRoomByID(roomId)
        if (!roomExists) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: `Room with id ${roomId} does not exist.`,
            })
            return
        }

        const deleteRoom = await roomModel.deleteRoomByID(roomId, coWorkingId)
        if (!deleteRoom) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
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

// @desc    Get all rooms
// @route   GET /api/v1/rooms
// @route   GET /api/v1/coworkings/:coworking_id/rooms
// @access  Public
export const getAllRooms = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const getAllRoomDTO = plainToInstance(GetAllRoomDTO, req.query)

        let rooms: Room[]

        //Access via coworkings/:coworking_id/rooms/
        //coworking_id exist = user wants to put in coworking_id
        if (req.params.coworking_id) {
            const coWorkingId = parseInt(req.params.coworking_id)
            if (Number.isNaN(coWorkingId)) {
                res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                    success: false,
                    msg: `Coworking with id ${coWorkingId} does not exist.`,
                })
                return
            }

            const coworkingExists =
                await coWorkingModel.getCoWorkingByID(coWorkingId)
            if (!coworkingExists) {
                res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                    success: false,
                    msg: `Coworking with id ${coWorkingId} does not exist.`,
                })
                return
            }

            rooms = await roomModel.getAllRooms(getAllRoomDTO, coWorkingId)
        }
        //Access via /rooms/
        else {
            rooms = await roomModel.getAllRooms(getAllRoomDTO)
        }

        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            data: rooms,
        })
    } catch (err) {
        console.error("Error during get all coworkings:", err)
        next(err)
    }
}

// @desc    Get one coworking
// @route   GET /api/v1/rooms/:id
// @route   GET /api/v1/coworkings/:coworking_id/rooms/:id
// @access  Public
export const getOneRoom = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const roomId = parseInt(req.params.id)

        if (Number.isNaN(roomId)) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: "There is no room that matchs with the provided ID",
            })
            return
        }

        let room: Room | null

        //Access via coworkings/:coworking_id/rooms/:id
        if (req.params.coworking_id) {
            const coWorkingId = parseInt(req.params.coworking_id)
            if (Number.isNaN(coWorkingId)) {
                res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                    success: false,
                    msg: `Coworking with id ${coWorkingId} does not exist.`,
                })
                return
            }

            const coworkingExists =
                await coWorkingModel.getCoWorkingByID(coWorkingId)
            if (!coworkingExists) {
                res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                    success: false,
                    msg: `Coworking with id ${coWorkingId} does not exist.`,
                })
                return
            }
            room = await roomModel.getRoomByID(roomId, coWorkingId)
        }

        //Access via /rooms/:id
        else {
            room = await roomModel.getRoomByID(roomId)
        }
        if (!room) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: "There is no room that matchs with the provided ID(s)",
            })
        }

        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            data: room,
        })
    } catch (err) {
        console.error("Error during get one room:", err)
        next(err)
    }
}

// @desc Get Room Unavailable Times
// @route GET /api/v1/rooms/:id/unavailable-times
// @route GET /api/v1/coworkings/:coworking_id/rooms/:id/unavailable-times
// @access Public
export const getRoomUnavailableTimes = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        let coWorkingId: number = 0
        let coWorking: CoWorking | null = null
        if (req.params.coworking_id) {
            coWorkingId = parseInt(req.params.coworking_id)
            if (Number.isNaN(coWorkingId)) {
                res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                    success: false,
                    msg: "There is no coworking that matchs with the provided ID.",
                })
                return
            }
            coWorking = await coWorkingModel.getCoWorkingByID(coWorkingId)
            if (!coWorking) {
                res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                    success: false,
                    msg: `Coworking with id ${coWorkingId} does not exist.`,
                })
                return
            }
        }

        const roomId = parseInt(req.params.id)
        if (Number.isNaN(roomId)) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: "There is no room that matchs with the provided ID.",
            })
            return
        }

        const room = await roomModel.getRoomByID(roomId)
        if (!room) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: `Room with id ${roomId} does not exist.`,
            })
            return
        }

        if (coWorking && room.coworking_id !== coWorking.id) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: `The room with id ${roomId} does not belong to the coworking with id ${coWorkingId}`,
            })
            return
        }

        const getAllReservationDTO = new GetAllReservationDTO()
        getAllReservationDTO.end_after = new Date()

        const roomUnavailableTimes = await reservationModel.getAllReservations(
            getAllReservationDTO,
            roomId,
            false,
        )

        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            data: roomUnavailableTimes.map((reservation) => {
                const { owner_id: _, ...reservationWithoutOwner } = reservation
                return reservationWithoutOwner
            }),
        })
    } catch (err) {
        console.error("Error during get room unavailable times:", err)
        next(err)
    }
}
