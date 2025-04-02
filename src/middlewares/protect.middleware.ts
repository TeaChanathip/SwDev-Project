import { NextFunction, Request, Response } from "express"
import { constants } from "http2"
import jwt from "jsonwebtoken"
import { UserModel } from "../models/user.model"
import { TokenPayload } from "../interfaces/TokenPayload.interface"
import { RequestWithUser } from "../interfaces/RequestWithUser.interface"

export const protect = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
) => {
    let token: string | null = null

    // Get token from authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1]
    }

    // Make sure token exists
    // token can be "null" when user is logged out
    if (!token || token === "null") {
        res.status(constants.HTTP_STATUS_UNAUTHORIZED).json({
            success: false,
            msg: "Not authorized to access this route",
        })
        return
    }

    try {
        const { JWT_SECRET } = process.env
        if (!JWT_SECRET) {
            throw new Error("JWT_SECRET environment variable is not defined")
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET)

        // Ensure the decoded token is of type TokenPayload
        if (
            typeof decoded === "object" &&
            decoded !== null &&
            "id" in decoded
        ) {
            const decodedToken = decoded as TokenPayload

            const userModel = new UserModel()
            const user = await userModel.getUserById(decodedToken.id)
            if (!user) {
                throw new Error("User not found")
            }

            // Add user into the request field
            req.user = user

            next()
        } else {
            throw new Error("Invalid token payload")
        }
    } catch (err) {
        console.error("Error during verify token:", err)

        // Handle specific JWT errors
        if (err instanceof jwt.JsonWebTokenError) {
            res.status(constants.HTTP_STATUS_UNAUTHORIZED).json({
                success: false,
                msg: "Invalid token",
            })
            return
        }

        // Handle other errors
        next(err)
    }
}
