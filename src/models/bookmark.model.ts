import connection from "../database/pgdb"
import { PaginationDTO } from "../dtos/pagination.dto"
export class BookmarkModel {
    private readonly tableName = `"bookmark"`

    async createBookmark(userId: number, roomId: number): Promise<Bookmark> {
        try {
            const queryResult = await connection.query<Bookmark>(
                `INSERT INTO ${this.tableName} (user_id, room_id) 
                VALUES ($1, $2) 
                RETURNING *`,
                [userId, roomId],
            )
            return queryResult.rows[0]
        } catch (err) {
            throw new Error(
                `Error creating bookmark: ${err instanceof Error ? err.message : err}`,
            )
        }
    }

    async deleteBookmark(
        userId: number,
        roomId: number,
    ): Promise<Bookmark | null> {
        try {
            const queryResult = await connection.query<Bookmark>(
                `DELETE FROM ${this.tableName}
                WHERE user_id = $1 AND room_id = $2 
                RETURNING *`,
                [userId, roomId],
            )
            if (queryResult.rowCount === 0) {
                return null
            }
            return queryResult.rows[0]
        } catch (err) {
            throw new Error(
                `Error deleting bookmark: ${err instanceof Error ? err.message : err}`,
            )
        }
    }
    async getBookmark(
        userId: number,
        roomId: number,
    ): Promise<Bookmark | null> {
        try {
            const queryResult = await connection.query<Bookmark>(
                `
                SELECT * FROM ${this.tableName}
                WHERE user_id = $1 AND room_id = $2 
                LIMIT 1
            `,
                [userId, roomId],
            )
            return queryResult.rows[0] || null
        } catch (err) {
            throw new Error(
                `Error retrieving bookmark: ${err instanceof Error ? err.message : err}`,
            )
        }
    }

    async getAllBookmarks(
        getAllBookmarkDTO: PaginationDTO,
    ): Promise<Bookmark[]> {
        try {
            const { page } = getAllBookmarkDTO

            // Set default value to limit and offset if not defined
            const limit = getAllBookmarkDTO.limit ?? 20
            const offset = page ? limit * page : 0

            const query = `
            SELECT * FROM ${this.tableName}
            LIMIT $1
            OFFSET $2
            `

            const queryResult = await connection.query<Bookmark>(query, [
                limit,
                offset,
            ])

            return queryResult.rows
        } catch (err) {
            throw new Error(
                `Error getting all bookmarks: ${err instanceof Error ? err.message : err}`,
            )
        }
    }
}

export interface Bookmark {
    user_id: number
    room_id: number
    created_at: Date
}
