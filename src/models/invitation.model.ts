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

    async getInvitaionByPK(
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
                status,
                created_after,
                created_before,
                page,
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

            // Set default value to limit and offset if not defined
            const limit = getAllInvitationsDTO.limit ?? 20
            const offset = page ? limit * page : 0

            // Build the query dynamically
            const whereClause =
                conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

            const query = `
                SELECT * FROM ${this.tableName}
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

// export interface PopulatedInvitation {
//     reservation: Reservation
//     inviter: User
//     invitee: User
//     status: InvitationStatus
//     created_at: Date
// }