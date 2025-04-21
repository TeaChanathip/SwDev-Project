import { NextFunction, Request, Response } from "express"
import { RequestWithUser } from "../interfaces/RequestWithUser.interface"
import { ReservationModel } from "../models/reservation.model"
import { InvitationModel, InvitationStatus } from "../models/invitation.model"
import { RoomModel } from "../models/room.model"
import { plainToInstance } from "class-transformer"
import { CreateInvitationDTO } from "../dtos/invitation.dto"
import { User, UserModel, UserRole } from "../models/user.model"
import { constants } from "http2"

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
        if (reservation.owner_id != me.id) {
            const myInvitation = existInvitations.find(
                (invitation) => invitation.invitee_id == me.id,
            )

            if (
                !myInvitation ||
                myInvitation.status != InvitationStatus.ACCEPTED
            ) {
                res.status(constants.HTTP_STATUS_FORBIDDEN).json({
                    success: false,
                    msg: `You don't have permission to create invitation for this reservation.`,
                })
                return
            }
        }

        const createInvitationDTO = plainToInstance(
            CreateInvitationDTO,
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

        const createdInvitations = await invitationModel.creteInvitations(
            reservationId,
            me.id,
            inviteesIds,
        )

        res.status(constants.HTTP_STATUS_CREATED).json({
            success: true,
            data: createdInvitations,
        })
    } catch (err) {
        console.error("Error during invitaions creation:", err)
        next(err)
    }
}
