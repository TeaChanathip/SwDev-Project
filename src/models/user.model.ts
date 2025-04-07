import connection from "../database/pgdb"
import { RegisterWithRoleDTO } from "../dtos/auth.dto"

export class UserModel {
    private readonly tableName = `"user"`

    async getUserById(id: number): Promise<User | null> {
        try {
            const queryResult = await connection.query<User>(
                `SELECT * FROM ${this.tableName} WHERE id=$1`,
                [id],
            )
            return queryResult.rows[0] || null
        } catch (err) {
            throw new Error(
                `Error retrieving user by id: ${err instanceof Error ? err.message : err}`,
            )
        }
    }

    async getUserByEmail(email: string): Promise<User | null> {
        try {
            const queryResult = await connection.query<User>(
                `SELECT * FROM ${this.tableName} WHERE email=$1`,
                [email],
            )
            return queryResult.rows[0] || null
        } catch (err) {
            throw new Error(
                `Error retrieving user by email: ${err instanceof Error ? err.message : err}`,
            )
        }
    }

    async createUser(user: RegisterWithRoleDTO): Promise<User> {
        try {
            const { name, phone, email, password, role } = user

            const queryResult = await connection.query<User>(
                `INSERT INTO ${this.tableName} (name, phone, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [name, phone, email, password, role],
            )
            return queryResult.rows[0]
        } catch (err) {
            throw new Error(
                `Error creating user: ${err instanceof Error ? err.message : err}`,
            )
        }
    }
}

export enum UserRole {
    USER = "user",
    ADMIN = "admin",
}

export interface User {
    id: number
    name: string
    phone: string
    email: string
    password: string
    role: UserRole
    created_at: Date
    updated_at: Date
}
