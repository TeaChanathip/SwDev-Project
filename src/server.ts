import express from "express"
import dotenv from "dotenv"
import path from "path"
import cors from "cors"

// ENV must be loaded before any other imports that use it!
dotenv.config({ path: path.resolve(__dirname, "../configs/config.env")})

const app = express()
app.use(cors())

// Body parser
app.use(express.json())

const PORT = process.env.PORT || 5000
const server = app.listen(PORT, () =>
    console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
    ),
)

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
    console.error(`Error: ${err.message}`)
    // Close server & exit process
    server.close(() => process.exit(1))
})

// Check database connection
import connection from "./database/pgdb"
connection.on("error", (err) => {
    console.error("Unexpected error on idle client", err)
    process.exit(-1)
})
