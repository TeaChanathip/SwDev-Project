import connection from "../database/pgdb"

export class InvitationModel {
    private readonly tableName = `"invitation"`

    async creteInvitations(
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
                `Error getting invitation by reservation_id: ${err instanceof Error ? err.message : err}`,
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
