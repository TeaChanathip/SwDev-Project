import express from "express"
import dotenv from "dotenv"
import path from "path"
import cors from "cors"
import cookieParser from "cookie-parser"

// ENV must be loaded before any other imports that use it!
dotenv.config({ path: path.resolve(__dirname, "../configs/config.env") })

// Check database connection
import connection from "./database/pgdb"
connection.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err)
        process.exit(1)
    } else {
        console.log("Database connected successfully")
    }
})

const app = express()
app.use(cors())

// Body parser
app.use(express.json())

// Cookie parser
app.use(cookieParser())

const PORT = process.env.PORT || 5000
const server = app.listen(PORT, () =>
    console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
    ),
)

// Import Routers
import authRouter from "./routes/auth.route"

// Use Routers
app.use("/api/v1/auth", authRouter)

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
    console.error(`Error: ${err.message}`)
    // Close server & exit process
    server.close(() => process.exit(1))
})
