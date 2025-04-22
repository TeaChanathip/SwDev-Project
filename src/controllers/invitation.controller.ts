import { NextFunction, Request, Response } from "express"
import { RequestWithUser } from "../interfaces/RequestWithUser.interface"
import { Reservation, ReservationModel } from "../models/reservation.model"
import {
    Invitation,
    InvitationModel,
    InvitationStatus,
} from "../models/invitation.model"
import { RoomModel } from "../models/room.model"
import { plainToInstance } from "class-transformer"
import {
    CreateInvitationsDTO,
    DeleteInvitationDTO,
    GetAllInvitationsDTO,
} from "../dtos/invitation.dto"
import { User, UserModel, UserRole } from "../models/user.model"
import { constants } from "http2"
import jwt from "jsonwebtoken"

const invitationModel = new InvitationModel()
const reservationModel = new ReservationModel()
const userModel = new UserModel()
const roomModel = new RoomModel()

// @desc    Create new invitation
// @route   POST /api/v1/reservations/:reservation_id/invitations
// @access  Private
export const createNewInvitation = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
) => {
    try {
        const reservationId = parseInt(req.params.reservation_id)
        // Check if reservation is in correct format
        if (Number.isNaN(reservationId)) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: "There is no reservation that matchs with the provided ID",
            })
            return
        }

        // Check if reservation acutually exists
        const reservation =
            await reservationModel.getReservationByID(reservationId)
        if (!reservation) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: `Reservation with id ${reservationId} does not exist.`,
            })
            return
        }

        // Check if reservation was in the past
        if (reservation.end_at <= new Date()) {
            res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                msg: `Reservation with id ${reservationId} is in the past.`,
            })
            return
        }

        const me = req.user!
        const existInvitations =
            await invitationModel.getInvitationByReservationId(reservationId)

        // Check if requester has permission
        if (!checkMyPermission(me, reservation, existInvitations, res)) {
            res.status(constants.HTTP_STATUS_FORBIDDEN).json({
                success: false,
                msg: `You don't have permission to create invitation for this reservation.`,
            })
            return
        }

        const createInvitationDTO = plainToInstance(
            CreateInvitationsDTO,
            req.body,
        )
        const inviteeEmails = createInvitationDTO.invitees!

        // Check if the number of users is exceeding the limit
        const room = await roomModel.getRoomByID(reservation.room_id)
        const nonRejectedInvitations = existInvitations.filter(
            (invitation) => invitation.status !== InvitationStatus.REJECTED,
        )
        if (
            room!.capacity <
            1 + nonRejectedInvitations.length + inviteeEmails.length
        ) {
            res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                msg: `The number of invitees is exceeding the room capacity (Current: ${1 + nonRejectedInvitations.length}/${room!.capacity}).`,
            })
            return
        }

        // Check if users with those emails exists
        const invitees: User[] = []
        const unexistEmails: string[] = []
        for (const email of inviteeEmails) {
            const user = await userModel.getUserByEmail(email)
            if (!user) {
                unexistEmails.push(email)
            } else {
                invitees.push(user)
            }
        }

        if (unexistEmails.length > 0) {
            res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                msg: `The following emails do not exist: ${unexistEmails.join(", ")}`,
            })
            return
        }

        // Check if the role of those users are not ADMIN
        const unallowedRoleInvitees: User[] = []
        invitees.forEach((invitee) => {
            if (invitee.role === UserRole.ADMIN) {
                unallowedRoleInvitees.push(invitee)
            }
        })
        if (unallowedRoleInvitees.length > 0) {
            res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                msg: `The following emails are not allowed to be invited: ${unallowedRoleInvitees
                    .map((invitee) => invitee.email)
                    .join(", ")}`,
            })
            return
        }

        // Check if new invitees duplicate with existing invitees (including the owner)
        const duplicatedUserIndexs: number[] = []
        const inviteesIds: number[] = []
        invitees.forEach((invitee, index) => {
            if (
                existInvitations.some(
                    (existInvitation) =>
                        existInvitation.invitee_id == invitee.id,
                ) ||
                invitee.id == reservation.owner_id
            ) {
                duplicatedUserIndexs.push(index)
            }

            inviteesIds.push(invitee.id)
        })
        if (duplicatedUserIndexs.length > 0) {
            res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                msg: `The following emails already have invitations: ${duplicatedUserIndexs
                    .map((index) => inviteeEmails[index])
                    .join(", ")}`,
            })
            return
        }

        const createdInvitations = await invitationModel.createInvitations(
            reservationId,
            me.id,
            inviteesIds,
        )

        res.status(constants.HTTP_STATUS_CREATED).json({
            success: true,
            data: createdInvitations,
        })
    } catch (err) {
        console.error("Error during invitations creation:", err)
        next(err)
    }
}

// @desc    Get all invitations
// @route   GET /api/v1/invitations
// @route   GET /api/v1/reservations/:reservation_id/invitations
// @access  Private
export const getAllInvitations = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
) => {
    try {
        const me = req.user!
        const getAllInvitationsDTO = plainToInstance(
            GetAllInvitationsDTO,
            req.query,
        )

        if (me.role === UserRole.USER) {
            if (getAllInvitationsDTO.inviter_id !== undefined) {
                res.status(constants.HTTP_STATUS_FORBIDDEN).json({
                    success: false,
                    msg: `You don't have permission to get invitations from other users.`,
                })
                return
            }

            // Only my invitation when reservation is undefined
            getAllInvitationsDTO.inviter_id = me.id
        }

        if (!req.params.reservation_id) {
            const invitations =
                await invitationModel.getAllInvitations(getAllInvitationsDTO)
            res.status(constants.HTTP_STATUS_OK).json({
                success: true,
                data: invitations,
            })
            return
        }

        // If access via /api/v1/reservations/:reservation_id/invitations
        const reservationId = parseInt(req.params.reservation_id)
        if (Number.isNaN(reservationId)) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: "There is no reservation that matchs with the provided ID",
            })
            return
        }

        const reservation =
            await reservationModel.getReservationByID(reservationId)
        if (!reservation) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: `Reservation with id ${reservationId} does not exist.`,
            })
            return
        }

        // Check if requester has permission
        if (me.role === UserRole.USER) {
            const existInvitations =
                await invitationModel.getInvitationByReservationId(
                    reservationId,
                )

            if (!checkMyPermission(me, reservation, existInvitations, res)) {
                res.status(constants.HTTP_STATUS_FORBIDDEN).json({
                    success: false,
                    msg: `You don't have permission to get invitations for this reservation.`,
                })
                return
            }

            // The inviter_id became optional field
            if (!req.query.inviter_id) {
                getAllInvitationsDTO.inviter_id = undefined
            }
        }

        getAllInvitationsDTO.reservation_id = reservationId
        const invitations =
            await invitationModel.getAllInvitations(getAllInvitationsDTO)

        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            data: invitations,
        })
    } catch (err) {
        console.error("Error getting all invitations:", err)
        next(err)
    }
}

// @desc    Get all invitations that are sended to me
// @route   GET /api/v1/invitations/to-me
// @access  Private
export const getAllInvitationsToMe = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
) => {
    try {
        const me = req.user!
        const getAllInvitationsDTO = plainToInstance(
            GetAllInvitationsDTO,
            req.query,
        )
        getAllInvitationsDTO.invitee_id = me.id

        const invitations =
            await invitationModel.getAllInvitations(getAllInvitationsDTO)

        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            data: invitations,
        })
    } catch (err) {
        console.error("Error getting all invitations to me:", err)
        next(err)
    }
}

// @desc    Delete invitation
// @route   DELETE /api/v1/reservation/:reservation_id/invitations
// @access  Private
export const deleteInvitation = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
) => {
    try {
        const reservationId = parseInt(req.params.reservation_id)
        if (Number.isNaN(reservationId)) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: "There is no reservation that matchs with the provided ID",
            })
            return
        }

        const reservation =
            await reservationModel.getReservationByID(reservationId)
        if (!reservation) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: `Reservation with id ${reservationId} does not exist.`,
            })
            return
        }
        if (reservation.end_at <= new Date()) {
            res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                msg: `Cannot delete invitation for reservation that is in the past.`,
            })
            return
        }

        const deleteInvitationDTO = plainToInstance(
            DeleteInvitationDTO,
            req.query,
        )
        const inviteeId = deleteInvitationDTO.invitee_id!

        const invitation = await invitationModel.getInvitaionByPK(
            reservationId,
            inviteeId,
        )
        if (!invitation) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: `There is no invitation to user with id ${inviteeId}`,
            })
            return
        }

        const me = req.user!
        if (
            me.role !== UserRole.ADMIN &&
            reservation.owner_id !== me.id &&
            invitation.inviter_id !== me.id
        ) {
            res.status(constants.HTTP_STATUS_FORBIDDEN).json({
                success: false,
                msg: `You don't have permission to delete this invitation.`,
            })
            return
        }

        await invitationModel.deleteInvitationByPK(reservationId, inviteeId)

        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            data: {},
        })
    } catch (err) {
        console.error("Error deleting invitation:", err)
        next(err)
    }
}

//
//
//
export const responseToInvitation = (
    type: Exclude<InvitationStatus, InvitationStatus.PENDING>,
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { JWT_SECRET } = process.env
            if (!JWT_SECRET) {
                throw new Error(
                    "JWT_SECRET environment variable is not defined",
                )
            }

            const token = req.params.token
            if (!token) {
                res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                    success: false,
                    msg: "Token is required",
                })
                return
            }

            const decoded = jwt.verify(token, JWT_SECRET)
            if (
                typeof decoded !== "object" ||
                decoded === null ||
                !("id" in decoded)
            ) {
                res.status(constants.HTTP_STATUS_UNAUTHORIZED).json({
                    success: false,
                    msg: "Invalid token"
                })
                return
            }

            const myId = decoded.id as number

            const reservationId = parseInt(req.params.reservation_id)
            if (Number.isNaN(reservationId)) {
                res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                    success: false,
                    msg: "There is no reservation that matchs with the provided ID",
                })
                return
            }

            const reservation =
                await reservationModel.getReservationByID(reservationId)
            if (!reservation) {
                res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                    success: false,
                    msg: `Reservation with id ${reservationId} does not exist.`,
                })
                return
            }
            if (reservation.end_at <= new Date()) {
                res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                    success: false,
                    msg: `Cannot ${type} invitation for reservation that is in the past.`,
                })
                return
            }

            const invitation = await invitationModel.getInvitaionByPK(
                reservationId,
                myId,
            )
            if (!invitation) {
                res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                    success: false,
                    msg: `There is no invitation to you`,
                })
                return
            }
            if (invitation.status !== InvitationStatus.PENDING) {
                res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                    success: false,
                    msg: `You have already accepted or rejected this invitation.`,
                })
                return
            }

            const updatedInvitation =
                await invitationModel.updateInvitationStatusByPK(
                    reservationId,
                    myId,
                    type,
                )

            res.status(constants.HTTP_STATUS_OK).json({
                success: true,
                data: updatedInvitation,
            })
        } catch (err) {
            console.error(`Error ${type}ing invitation:`, err)
            next(err)
        }
    }
}

const checkMyPermission = (
    me: User,
    reservation: Reservation,
    existInvitations: Invitation[],
    res: Response,
): Boolean => {
    if (reservation.owner_id === me.id) {
        return true
    }

    const myInvitation = existInvitations.find(
        (invitation) => invitation.invitee_id == me.id,
    )
    if (!myInvitation) {
        return false
    }

    return myInvitation.status === InvitationStatus.ACCEPTED
}
