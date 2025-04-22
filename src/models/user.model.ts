import connection from "../database/pgdb"
import { RegisterWithRoleDTO } from "../dtos/auth.dto"
import { GetAllUsersDTO, UpdateUserDTO } from "../dtos/user.dto"

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

    async createUser(registerWithRoleDTO: RegisterWithRoleDTO): Promise<User> {
        try {
            const { name, phone, email, password, role } = registerWithRoleDTO

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

    async getAllUser(getAllUsersDTO: GetAllUsersDTO): Promise<User[]> {
        try {
            const {
                name,
                phone,
                email,
                role,
                created_after,
                created_before,
                updated_after,
                updated_before,
                page,
            } = getAllUsersDTO

            // Generate the SQL condition from query params
            const conditions: string[] = []
            const values: any[] = []
            let index = 1

            if (name) {
                conditions.push(`name ILIKE $${index++}`)
                values.push(`%${name}%`)
            }

            if (phone) {
                conditions.push(`phone = $${index++}`)
                values.push(phone)
            }

            if (email) {
                conditions.push(`email ILIKE $${index++}`)
                values.push(`%${email}%`)
            }

            if (role) {
                conditions.push(`role = $${index++}`)
                values.push(role)
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
            const limit = getAllUsersDTO.limit ?? 20
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

            const queryResult = await connection.query<User>(query, [
                ...values,
                limit,
                offset,
            ])

            return queryResult.rows
        } catch (err) {
            throw new Error(
                `Error getting all users: ${err instanceof Error ? err.message : err}`,
            )
        }
    }

    async updateUserById(
        id: number,
        updateUserDTO: UpdateUserDTO,
    ): Promise<User> {
        try {
            const fieldsName: string[] =
                Object.getOwnPropertyNames(updateUserDTO)
            const fields: string[] = []
            const values: any[] = []
            let index = 1

            for (const field of fieldsName) {
                let keyName = field as keyof UpdateUserDTO
                if (updateUserDTO[keyName] !== undefined) {
                    fields.push(`${field} = $${index}`)
                    values.push(updateUserDTO[keyName])
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
            const queryResult = await connection.query<User>(query, values)

            return queryResult.rows[0]
        } catch (err) {
            throw new Error(
                `Error updating an user: ${err instanceof Error ? err.message : err}`,
            )
        }
    }

    async deleteUserById(id: number): Promise<User> {
        try {
            const queryResult = await connection.query<User>(
                `DELETE FROM ${this.tableName}
                WHERE id = $1
                RETURNING *`,
                [id],
            )

            return queryResult.rows[0]
        } catch (err) {
            throw new Error(
                `Error deleting user: ${err instanceof Error ? err.message : err}`,
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
