import connection from "../database/pgdb"

export class CoWorkingModel {
    private readonly tableName  = `"coworking"`

    async createCoWorking(
        coWorking : Omit<CoWorking, "id" | "created_at" | "updated_at">
    ): Promise<CoWorking> {
        try {
            const queryResult = await connection.query<CoWorking>(
                `INSERT INTO ${this.tableName} (name, address, phone, open_time, close_time) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [
                    coWorking.name,
                    coWorking.address,
                    coWorking.phone,
                    coWorking.open_time,
                    coWorking.close_time,
                ]
            )
            return queryResult.rows[0]
        } catch (err) {
            throw new Error(
                `Error creating coworking: ${err instanceof Error ? err.message : err}`,
            )
        }
    }
}

export enum UserRole {
    USER = "user",
    ADMIN = "admin",
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