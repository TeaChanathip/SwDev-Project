import connection from "../database/pgdb"
import { GetAllInvitationsDTO } from "../dtos/invitation.dto"
import { Reservation } from "./reservation.model"
import { User } from "./user.model"

export class InvitationModel {
    private readonly tableName = `"invitation"`

    async createInvitations(
        reservationId: number,
        inviterId: number,
        inviteeIds: number[],
    ): Promise<Invitation[]> {
        try {
            const values = inviteeIds
                .map((inviteeId, index) => `($1, $2, $${index + 3})`)
                .join(", ")

            const query = `
                INSERT INTO ${this.tableName} (reservation_id, inviter_id, invitee_id)
                VALUES ${values}
                RETURNING *
            `

            const queryResult = await connection.query<Invitation>(query, [
                reservationId,
                inviterId,
                ...inviteeIds,
            ])

            return queryResult.rows
        } catch (err) {
            throw new Error(
                `Error creating invitations: ${err instanceof Error ? err.message : err}`,
            )
        }
    }

    async getInvitationByPK(
        reservationId: number,
        inviteeId: number,
    ): Promise<Invitation | null> {
        try {
            const queryResult = await connection.query<Invitation>(
                `SELECT * FROM ${this.tableName}
                WHERE reservation_id = $1 AND invitee_id = $2`,
                [reservationId, inviteeId],
            )
            return queryResult.rowCount == 0 ? null : queryResult.rows[0]
        } catch (err) {
            throw new Error(
                `Error getting invitation by PK: ${err instanceof Error ? err.message : err}`,
            )
        }
    }

    async getInvitationByReservationId(
        reservationId: number,
    ): Promise<Invitation[]> {
        try {
            const queryResult = await connection.query<Invitation>(
                `SELECT * FROM ${this.tableName}
                WHERE reservation_id = $1`,
                [reservationId],
            )
            return queryResult.rows
        } catch (err) {
            throw new Error(
                `Error getting invitations by reservation_id: ${err instanceof Error ? err.message : err}`,
            )
        }
    }

    async getAllInvitations(
        getAllInvitationsDTO: GetAllInvitationsDTO,
    ): Promise<Invitation[]> {
        try {
            const {
                reservation_id,
                inviter_id,
                invitee_id,
                status,
                created_after,
                created_before,
                page,
                is_future_event,
            } = getAllInvitationsDTO

            // Generate the SQL condition from query params
            const conditions: string[] = []
            const values: any[] = []
            let index = 1

            if (reservation_id) {
                conditions.push(`reservation_id = $${index++}`)
                values.push(reservation_id)
            }

            if (inviter_id) {
                conditions.push(`inviter_id = $${index++}`)
                values.push(inviter_id)
            }

            if (invitee_id) {
                conditions.push(`invitee_id = $${index++}`)
                values.push(invitee_id)
            }

            if (status) {
                conditions.push(`status = $${index++}`)
                values.push(status)
            }

            if (created_after) {
                conditions.push(`created_at >= $${index++}`)
                values.push(created_after)
            }

            if (created_before) {
                conditions.push(`created_at <= $${index++}`)
                values.push(created_before)
            }

            if (is_future_event) {
                conditions.push(`res.end_at > $${index++}`)
                values.push(new Date())
            }

            // Set default value to limit and offset if not defined
            const limit = getAllInvitationsDTO.limit ?? 20
            const offset = page ? limit * page : 0

            // Build the query dynamically
            let whereClause =
                conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

            let query = `
                SELECT reservation_id, invitee_id, inviter_id, status, inv.created_at
                FROM ${this.tableName} AS inv`

            if (is_future_event) {
                query += `
                    LEFT JOIN "reservation" AS res
                    ON inv.reservation_id = res.id`
            }

            query += `
                ${whereClause}
                LIMIT $${index}
                OFFSET $${index + 1}`

            const queryResult = await connection.query<Invitation>(query, [
                ...values,
                limit,
                offset,
            ])

            return queryResult.rows
        } catch (err) {
            throw new Error(
                `Error getting all invitations: ${err instanceof Error ? err.message : err}`,
            )
        }
    }

    async deleteInvitationByPK(
        reservationId: number,
        inviteeId: number,
    ): Promise<Invitation> {
        try {
            const queryResult = await connection.query(
                `DELETE FROM ${this.tableName}
                WHERE reservation_id = $1 AND invitee_id = $2
                RETURNING *`,
                [reservationId, inviteeId],
            )

            return queryResult.rows[0]
        } catch (err) {
            throw new Error(
                `Error deleting invitation: ${err instanceof Error ? err.message : err}`,
            )
        }
    }

    async updateInvitationStatusByPK(
        reservationId: number,
        inviteeId: number,
        status: InvitationStatus,
    ): Promise<Invitation> {
        try {
            const queryResult = await connection.query(
                `UPDATE ${this.tableName}
                SET status = $1
                WHERE reservation_id = $2 AND invitee_id = $3
                RETURNING *`,
                [status, reservationId, inviteeId],
            )

            return queryResult.rows[0]
        } catch (err) {
            throw new Error(
                `Error updating invitation status: ${err instanceof Error ? err.message : err}`,
            )
        }
    }

    async getICalInvitations(
        invitee_id: number
    ): Promise<ICalInvitation[]> {
        try {
            const query = `
            SELECT inv.status, "user".name AS owner_name, "user".email AS owner_email, res.start_at, res.end_at, room.name AS room_name, cow.name AS coworking_name, cow.address, cow.phone
            FROM ${this.tableName} AS inv
            LEFT JOIN "reservation" AS res ON res.id = inv.reservation_id
            LEFT JOIN "room" ON room.id = res.room_id
            LEFT JOIN "coworking" AS cow ON cow.id = room.coworking_id
            LEFT JOIN "user" ON "user".id = res.owner_id
            WHERE inv.invitee_id = $1
        `
        const queryResult = await connection.query<ICalInvitation>(query, [invitee_id])

        return queryResult.rows
        } catch (err) {
            throw new Error(
                `Error get invitations for ICalendar: ${err instanceof Error ? err.message : err}`,
            )
        }
    }
}

export interface Invitation {
    reservation_id: number
    inviter_id: number
    invitee_id: number
    status: InvitationStatus
    created_at: Date
}

export enum InvitationStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
    REJECTED = "rejected",
}

export interface ICalInvitation {
    status: InvitationStatus
    owner_name: string
    owner_email: string
    start_at: Date
    end_at: Date
    room_name: string
    coworking_name: string
    address: string
    phone: string
}
