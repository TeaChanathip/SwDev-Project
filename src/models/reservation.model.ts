import connection from "../database/pgdb"
import {
    CreateReservationDTO,
    GetAllReservationDTO,
    UpdateReservationDTO,
} from "../dtos/reservation.dto"
import { UserRole } from "./user.model"

export class ReservationModel {
    private readonly tableName = `"reservation"`

    async createReservation(
        reservation: CreateReservationDTO,
        ownerId: number,
        roomId: number,
    ): Promise<Reservation> {
        try {
            const queryResult = await connection.query<Reservation>(
                `INSERT INTO ${this.tableName} (owner_id, room_id, start_at, end_at) 
                VALUES ($1, $2, $3, $4) 
                RETURNING *`,
                [ownerId, roomId, reservation.start_at, reservation.end_at],
            )
            return queryResult.rows[0]
        } catch (err) {
            throw new Error(
                `Error creating reservation: ${err instanceof Error ? err.message : err}`,
            )
        }
    }

    async updateReservationByID(
        reservation: UpdateReservationDTO,
        reservationId: number,
        roomId?: number,
    ): Promise<Reservation> {
        try {
            const fieldsName: string[] = Object.getOwnPropertyNames(reservation)
            const fields: string[] = []
            const values: any[] = []
            let index = 1

            for (const field of fieldsName) {
                let keyName = field as keyof UpdateReservationDTO
                fields.push(`${field} = $${index}`)
                values.push(reservation[keyName])
                index++
            }
            const conditions: string[] = [`id = $${index}`]
            values.push(reservationId)

            if (roomId) {
                conditions.push(`room_id = $${index + 1}`)
                values.push(roomId)
            }

            const query = `
                UPDATE ${this.tableName}
                SET ${fields.join(", ")}
                WHERE ${conditions.join(" AND ")}
                RETURNING *
            `

            const queryResult = await connection.query<Reservation>(
                query,
                values,
            )
            if (queryResult.rows.length === 0) {
                throw new Error(
                    `Reservation with ID ${reservationId} of room with ID ${roomId} not found`,
                )
            }

            return queryResult.rows[0]
        } catch (err) {
            throw new Error(
                `Error updating reservation: ${err instanceof Error ? err.message : err}`,
            )
        }
    }

    async deleteReservationByID(
        reservationId: number,
        roomId?: number,
    ): Promise<Reservation | null> {
        try {
            const conditions: string[] = ["id = $1"]
            const values: number[] = [reservationId]
            if (roomId) {
                conditions.push("room_id = $2")
                values.push(roomId)
            }
            const queryResult = await connection.query<Reservation>(
                `DELETE FROM ${this.tableName}
                WHERE ${conditions.join(" AND ")}
                RETURNING *`,
                values,
            )
            if (queryResult.rowCount === 0) {
                return null
            }
            return queryResult.rows[0]
        } catch (err) {
            throw new Error(
                `Error deleting reservation: ${err instanceof Error ? err.message : err}`,
            )
        }
    }

    async getAllReservations(
        getAllReservationDTO: GetAllReservationDTO,
        roomId?: number,
    ): Promise<Reservation[]> {
        try {
            const {
                user_id,
                start_before,
                start_after,
                end_before,
                end_after,
                created_after,
                created_before,
                updated_after,
                updated_before,
                page,
                limit,
            } = getAllReservationDTO

            // Generate the SQL condition from query params
            const conditions: string[] = []
            const values: any[] = []
            let index = 1

            if (user_id) {
                conditions.push(`owner_id = $${index++}`)
                values.push(user_id)
            }

            if (roomId) {
                conditions.push(`room_id = $${index++}`)
                values.push(roomId)
            }

            if (start_after) {
                conditions.push(`start_at >= $${index++}`)
                values.push(start_after)
            }

            if (start_before) {
                conditions.push(`start_at <= $${index++}`)
                values.push(start_before)
            }

            if (end_after) {
                conditions.push(`end_at >= $${index++}`)
                values.push(end_after)
            }

            if (end_before) {
                conditions.push(`end_at <= $${index++}`)
                values.push(end_before)
            }

            if (created_after) {
                conditions.push(`created_at >= $${index++}`)
                values.push(created_after)
            }

            if (created_before) {
                conditions.push(`created_at <= $${index++}`)
                values.push(created_before)
            }

            if (updated_after) {
                conditions.push(`updated_at >= $${index++}`)
                values.push(updated_after)
            }

            if (updated_before) {
                conditions.push(`updated_at <= $${index++}`)
                values.push(updated_before)
            }

            // Set default value to limit and offset if not defined
            const queryLimit = limit ?? 20
            const offset = page ? queryLimit * page : 0

            // Build the query dynamically
            const whereClause =
                conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

            const query = `
                SELECT * FROM ${this.tableName}
                ${whereClause}
                LIMIT $${index}
                OFFSET $${index + 1}
            `

            const queryResult = await connection.query<Reservation>(query, [
                ...values,
                queryLimit,
                offset,
            ])

            return queryResult.rows
        } catch (err) {
            throw new Error(
                `Error getting all reservations: ${
                    err instanceof Error ? err.message : err
                }`,
            )
        }
    }

    async getMyReservationByID(
        reservationId: number,
        userRole: UserRole,
        userId: number,
        roomId?: number,
    ): Promise<Reservation | null> {
        try {
            const conditions: string[] = [`id = $1`]
            const values: any[] = [reservationId]
            let index = 2

            if (userRole == UserRole.USER) {
                conditions.push(`owner_id = $${index++}`)
                values.push(userId)
            }

            if (roomId) {
                conditions.push(`room_id = $${index}`)
                values.push(roomId)
            }

            const query = `
                SELECT * FROM ${this.tableName}
                WHERE ${conditions.join(" AND ")}
                LIMIT 1
            `

            const queryResult = await connection.query(query, values)

            return queryResult.rows[0] || null
        } catch (err) {
            throw new Error(
                `Error get reservation by Id: ${err instanceof Error ? err.message : err}`,
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
