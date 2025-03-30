import express from "express"
import dotenv from "dotenv"
import cors from "cors"

dotenv.config({ path: "../configs/config.env" })

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
