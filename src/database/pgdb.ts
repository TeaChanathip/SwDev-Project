import { Pool } from "pg"

const { PG_USER, PG_HOST, PG_DB, PG_PWD, PG_PORT } = process.env

if (!PG_USER || !PG_HOST || !PG_DB || !PG_PWD || !PG_PORT) {
    throw new Error(
        "Missing required environment variables for database connection",
    )
}

const connection = new Pool({
    user: PG_USER,
    host: PG_HOST,
    database: PG_DB,
    password: PG_PWD,
    port: Number(PG_PORT),
})

export default connection
