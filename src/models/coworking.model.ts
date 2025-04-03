import { deleteCoWorking } from "../controllers/coworking.controller"
import connection from "../database/pgdb"
import { CreateCoWorkingDTO, UpdateCoWorkingDTO } from "../dtos/coworking.dto"

export class CoWorkingModel {
    private readonly tableName = `"coworking"`

    async createCoWorking(coWorking: CreateCoWorkingDTO): Promise<CoWorking> {
        try {
            const queryResult = await connection.query<CoWorking>(
                `INSERT INTO ${this.tableName} (name, address, phone, open_time, close_time) 
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING *`,
                [
                    coWorking.name,
                    coWorking.address,
                    coWorking.phone,
                    coWorking.open_time,
                    coWorking.close_time,
                ],
            )
            return queryResult.rows[0]
        } catch (err) {
            throw new Error(
                `Error creating coworking: ${err instanceof Error ? err.message : err}`,
            )
        }
    }

    async updateCoWorkingByID(
        id: number,
        coWorking: UpdateCoWorkingDTO,
    ): Promise<CoWorking> {
        try {
            const fieldsName: string[] = Object.getOwnPropertyNames(coWorking)
            const fields: string[] = []
            const values: any[] = []
            let index = 1

            for (const field of fieldsName) {
                let keyName = field as keyof UpdateCoWorkingDTO
                if (coWorking[keyName] !== undefined) {
                    fields.push(`${field} = $${index}`)
                    values.push(coWorking[keyName])
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
    async deleteCoWorkingByID(id: number): Promise<CoWorking | null> {
        try {
            const queryResult = await connection.query<CoWorking>(
                `DELETE FROM ${this.tableName}
                WHERE id = $1
                RETURNING *`,
                [id],
            )
            if (queryResult.rowCount === 0) {
                return null
            }
            return queryResult.rows[0]
        } catch (err) {
            throw new Error(
                `Error deleting coworking: ${err instanceof Error ? err.message : err}`,
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
