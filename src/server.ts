import express from "express"
import dotenv from "dotenv"
import path from "path"
import cors from "cors"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import hpp from "hpp"
import rateLimit from "express-rate-limit"
import { xss } from "express-xss-sanitizer"

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

// Set security headers
app.use(helmet())

// Prevent HTTP param pollutions
app.use(hpp())

// Rate Limiting
app.use(
    rateLimit({
        windowMs: 10 * 60 * 1000, // 10 mins
        max: 100,
    }),
)

// Prevent cross-site scripting attacks
app.use(xss())

// Run the server
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
