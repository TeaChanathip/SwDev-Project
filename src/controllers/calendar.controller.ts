import { NextFunction, Response } from "express"
import { RequestWithUser } from "../interfaces/RequestWithUser.interface"
import { ICalReservation, ReservationModel } from "../models/reservation.model"
import {
    ICalInvitation,
    InvitationModel,
    InvitationStatus,
} from "../models/invitation.model"
import ical, {
    ICalAttendeeStatus,
    ICalCalendar,
    ICalEvent,
} from "ical-generator"
import { User } from "../models/user.model"
import { constants } from "http2"

const reservationModel = new ReservationModel()
const invitationModel = new InvitationModel()

// @desc    Get calendar
// @route   GET /api/v1/calendars
// @access  Private
export const getICalendar = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
) => {
    try {
        const me = req.user!
        const myReservations = await reservationModel.getICalReservations(me.id)
        const invitationsToMe = await invitationModel.getICalInvitations(me.id)

        const calendar_name = `${me.name}_coworkingspace_calendar_${new Date()
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, "")}`

        const calendar = ical({
            name: calendar_name,
        })

        cvtReservations2ICalEvent(myReservations, calendar, me).forEach(
            (event) => calendar.createEvent(event),
        )
        cvtInvitations2ICalEvent(invitationsToMe, calendar, me).forEach(
            (event) => calendar.createEvent(event),
        )

        // Set the appropriate headers for an iCalendar file
        res.writeHead(constants.HTTP_STATUS_OK, {
            "Content-Type": "text/calendar; charset=utf-8",
            "Content-Disposition": `attachment; filename="${calendar_name}.ics"`,
        })

        res.end(calendar.toString())
    } catch (err) {
        console.error("Error during get calendar:", err)
        next(err)
    }
}

const cvtReservations2ICalEvent = (
    icalReservations: ICalReservation[],
    calendar: ICalCalendar,
    me: User,
): ICalEvent[] => {
    return icalReservations.map((icalReservation) => {
        const { start_at, end_at, room_name, coworking_name, address, phone } =
            icalReservation

        const location =
            `Room: ${room_name}\n` +
            `Co-working Space: ${coworking_name}\n` +
            `Address: ${address}\n` +
            `Phone: ${phone}`

        return new ICalEvent(
            {
                start: start_at,
                end: end_at,
                summary: `Reservation at ${room_name}`,
                location: location,
                organizer: {
                    name: me.name,
                    email: me.email,
                },
            },
            calendar,
        )
    })
}

const cvtInvitations2ICalEvent = (
    icalInvitations: ICalInvitation[],
    calendar: ICalCalendar,
    me: User,
): ICalEvent[] => {
    return icalInvitations.map((icalInvitation) => {
        const {
            status,
            owner_name,
            owner_email,
            start_at,
            end_at,
            room_name,
            coworking_name,
            address,
            phone,
        } = icalInvitation

        const location =
            `Room: ${room_name}\n` +
            `Co-working Space: ${coworking_name}\n` +
            `Address: ${address}\n` +
            `Phone: ${phone}`

        return new ICalEvent(
            {
                start: start_at,
                end: end_at,
                summary: `Invitation to ${room_name}`,
                location: location,
                organizer: {
                    name: owner_name,
                    email: owner_email,
                },
                attendees: [
                    {
                        name: me.name,
                        email: me.email,
                        status: cvtInvitation2ICalAttendeeStatus(status),
                    },
                ],
            },
            calendar,
        )
    })
}

const cvtInvitation2ICalAttendeeStatus = (
    invitationStatus: InvitationStatus,
): ICalAttendeeStatus => {
    switch (invitationStatus) {
        case InvitationStatus.ACCEPTED:
            return ICalAttendeeStatus.ACCEPTED
        case InvitationStatus.PENDING:
            return ICalAttendeeStatus.NEEDSACTION
        case InvitationStatus.REJECTED:
            return ICalAttendeeStatus.DECLINED
    }
}
