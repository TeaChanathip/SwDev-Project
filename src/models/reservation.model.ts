import connection from "../database/pgdb"
import { CreateReservationDTO, } from "../dtos/reservation.dto"

export class ReservationModel {
    private readonly tableName = `"reservation"`

    async createReservation( reservation: CreateReservationDTO): Promise<Reservation> {
        try {
            const queryResult = await connection.query<Reservation>(
                `INSERT INTO ${this.tableName} (owner_id, room_id, start_at, end_at) 
                VALUES ($1, $2, $3, $4) 
                RETURNING *`,
                [reservation.owner_id, reservation.room_id, reservation.start_at, reservation.end_at],
            )
            return queryResult.rows[0]
        } catch (err) {
            throw new Error(
                `Error creating reservation: ${err instanceof Error ? err.message : err}`,
            )
        }
    }
}

export interface Reservation {
    id: number
    room_id: number
    user_id: number
    start_at: Date
    end_at: Date
    created_at: Date
    updated_at: Date
}