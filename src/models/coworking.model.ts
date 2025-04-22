import { deleteCoWorking } from "../controllers/coworking.controller"
import connection from "../database/pgdb"
import {
    CreateCoWorkingDTO,
    GetAllCoWorkingDTO,
    UpdateCoWorkingDTO,
} from "../dtos/coworking.dto"

export class CoWorkingModel {
    private readonly tableName = `"coworking"`

    async createCoWorking(createCoWorkingDTO: CreateCoWorkingDTO): Promise<CoWorking> {
        try {
            const queryResult = await connection.query<CoWorking>(
                `INSERT INTO ${this.tableName} (name, address, phone, open_time, close_time) 
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING *`,
                [
                    createCoWorkingDTO.name,
                    createCoWorkingDTO.address,
                    createCoWorkingDTO.phone,
                    createCoWorkingDTO.open_time,
                    createCoWorkingDTO.close_time,
                ],
            )
            return queryResult.rows[0]
        } catch (err) {
            throw new Error(
                `Error creating coworking: ${err instanceof Error ? err.message : err}`,
            )
        }
    }

    async updateCoWorkingById(
        id: number,
        updateCoWorkingDTO: UpdateCoWorkingDTO,
    ): Promise<CoWorking> {
        try {
            const fieldsName: string[] = Object.getOwnPropertyNames(updateCoWorkingDTO)
            const fields: string[] = []
            const values: any[] = []
            let index = 1

            for (const field of fieldsName) {
                let keyName = field as keyof UpdateCoWorkingDTO
                if (updateCoWorkingDTO[keyName] !== undefined) {
                    fields.push(`${field} = $${index}`)
                    values.push(updateCoWorkingDTO[keyName])
                    index++
                }
            }
            values.push(id)

            const query = `
            UPDATE ${this.tableName}
            SET ${fields.join(", ")}
            WHERE id = $${index}
            RETURNING *
            `
            const queryResult = await connection.query<CoWorking>(query, values)
            if (queryResult.rows.length === 0) {
                throw new Error(`CoWorking with ID ${id} not found`)
            }

            return queryResult.rows[0]
        } catch (err) {
            throw new Error(
                `Error updating coworking: ${err instanceof Error ? err.message : err}`,
            )
        }
    }
    async deleteCoWorkingById(id: number): Promise<CoWorking> {
        try {
            const queryResult = await connection.query<CoWorking>(
                `DELETE FROM ${this.tableName}
                WHERE id = $1
                RETURNING *`,
                [id],
            )

            return queryResult.rows[0]
        } catch (err) {
            throw new Error(
                `Error deleting coworking: ${err instanceof Error ? err.message : err}`,
            )
        }
    }

    async getAllCoWorkings(
        getAllCoWorkingDTO: GetAllCoWorkingDTO,
    ): Promise<CoWorking[]> {
        try {
            const {
                name,
                address,
                open_time,
                close_time,
                created_after,
                created_before,
                updated_after,
                updated_before,
                page,
            } = getAllCoWorkingDTO

            // Generate the SQL condition from query params
            const conditions: string[] = []
            const values: any[] = []
            let index = 1

            if (name) {
                conditions.push(`name ILIKE $${index++}`)
                values.push(`%${name}%`)
            }

            if (address) {
                conditions.push(`address ILIKE $${index++}`)
                values.push(`%${address}%`)
            }

            if (open_time) {
                conditions.push(`open_time <= $${index++}`)
                values.push(open_time)
            }

            if (close_time) {
                conditions.push(`close_time >= $${index++}`)
                values.push(close_time)
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
            const limit = getAllCoWorkingDTO.limit ?? 20
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

            const queryResult = await connection.query<CoWorking>(query, [
                ...values,
                limit,
                offset,
            ])

            return queryResult.rows
        } catch (err) {
            throw new Error(
                `Error getting all coworkings: ${err instanceof Error ? err.message : err}`,
            )
        }
    }

    async getCoWorkingById(id: number): Promise<CoWorking | null> {
        try {
            const queryResult = await connection.query(
                `SELECT * FROM ${this.tableName} WHERE id = $1 LIMIT 1`,
                [id],
            )

            return queryResult.rows[0] || null
        } catch (err) {
            throw new Error(
                `Error get coworking by Id: ${err instanceof Error ? err.message : err}`,
            )
        }
    }
}

export interface CoWorking {
    id: number
    name: string
    address: string
    phone: string
    open_time: string
    close_time: string
    created_at: Date
    updated_at: Date
}
