import connection from "../database/pgdb"
import {
    CreateRoomDTO,
    GetAllRoomDTO,
    UpdateRoomDTO,
} from "../dtos/room.dto"

export class RoomModel {
    private readonly tableName = `"room"`

    async createRoom(coWorkingId: number,room: CreateRoomDTO, ): Promise<Room> {
        try {
            const queryResult = await connection.query<Room>(
                `INSERT INTO ${this.tableName} (name, capacity, price, coworking_id) 
                VALUES ($1, $2, $3, $4) 
                RETURNING *`,
                [
                    room.name,
                    room.capacity,
                    room.price,
                    coWorkingId
                ],
            )
            return queryResult.rows[0]
        } catch (err) {
            throw new Error(
                `Error creating room: ${err instanceof Error ? err.message : err}`,
            )
        }
    }

    async updateRoomByID(
        roomId: number,
        coWorkingId: number,
        room: UpdateRoomDTO,
    ): Promise<Room> {
        try {
            const fieldsName: string[] = Object.getOwnPropertyNames(room)
            const fields: string[] = []
            const values: any[] = []
            let index = 1

            for (const field of fieldsName) {
                let keyName = field as keyof UpdateRoomDTO
                if (room[keyName] !== undefined) {
                    fields.push(`${field} = $${index}`)
                    values.push(room[keyName])
                    index++
                }
            }
            values.push(roomId)
            values.push(coWorkingId)

            const query = `
            UPDATE ${this.tableName}
            SET ${fields.join(", ")}
            WHERE id = $${index} AND coworking_id = $${index+1}
            RETURNING *
            `
            const queryResult = await connection.query<Room>(query, values)
            if (queryResult.rows.length === 0) {
                throw new Error(`Room with ID ${roomId} of coworking with ID ${coWorkingId} not found`)
            }

            return queryResult.rows[0]
        } catch (err) {
            throw new Error(
                `Error updating room: ${err instanceof Error ? err.message : err}`,
            )
        }
    }
    async deleteRoomByID(roomId: number, coWorkingId: number): Promise<Room | null> {
        try {
            const queryResult = await connection.query<Room>(
                `DELETE FROM ${this.tableName}
                WHERE id = $1 AND coworking_id = $2
                RETURNING *`,
                [roomId, coWorkingId],
            )
            if (queryResult.rowCount === 0) {
                return null
            }
            return queryResult.rows[0]
        } catch (err) {
            throw new Error(
                `Error deleting room: ${err instanceof Error ? err.message : err}`,
            )
        }
    }

    async getAllRooms(
        getAllRoomDTO: GetAllRoomDTO,
        coWorkingId?: number
    ): Promise<Room[]> {
        try {
            const {
                name,
                capacity,
                price,
                created_after,
                created_before,
                updated_after,
                updated_before,
                page,
            } = getAllRoomDTO

            // Generate the SQL condition from query params
            const conditions: string[] = []
            const values: any[] = []
            let index = 1

            if (name) {
                conditions.push(`name ILIKE $${index++}`)
                values.push(`%${name}%`)
            }

            if (capacity) {
                conditions.push(`capacity >= $${index++}`)
                values.push(capacity)
            }

            if (price) {
                conditions.push(`open_time <= $${index++}`)
                values.push(price)
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

            if (coWorkingId) {
                conditions.push(`coworking_id = $${index++}`)
                values.push(coWorkingId)
            }

            // Set default value to limit and offset if not defined
            const limit = getAllRoomDTO.limit ?? 20
            const offset = page ? limit * page : 0

            // Build the query dynamically
            const whereClause =
                conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

            const query = `
            SELECT * FROM ${this.tableName}
            ${whereClause}
            LIMIT $${index}
            OFFSET $${index + 1}
            `

            const queryResult = await connection.query<Room>(query, [
                ...values,
                limit,
                offset,
            ])

            return queryResult.rows
        } catch (err) {
            throw new Error(
                `Error getting all room: ${err instanceof Error ? err.message : err}`,
            )
        }
    }

    async getRoomByID(id: number, coWorkingId? : number): Promise<Room | null> {
        try {
            const conditions: string[] = [`id = $1`];
            const values: any[] = [id];

            if (coWorkingId) {
                conditions.push(`coworking_id = $2`);
                values.push(coWorkingId);
            }

            const query = `
                SELECT * FROM ${this.tableName}
                WHERE ${conditions.join(" AND ")}
                LIMIT 1
            `;

            const queryResult = await connection.query(query, values);

            return queryResult.rows[0] || null;
        } catch (err) {
            throw new Error(
                `Error get room by Id: ${err instanceof Error ? err.message : err}`,
            )
        }
    }
}

export interface Room {
    id: number
    name: string
    capacity: number
    price: number
    coworking_id: number
    created_at: Date
    updated_at: Date
}
