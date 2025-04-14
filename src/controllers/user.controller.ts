import { NextFunction, Request, response, Response } from "express"
import { UserModel } from "../models/user.model"
import { RequestWithUser } from "../interfaces/RequestWithUser.interface"
import { constants } from "http2"

const userModel = new UserModel()

// @desc    Get One User (themself)
// @route   GET /api/v1/users/getMe
// @access  Private
export const getMe = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
) => {
    try {
        if (!req.user) {
            // Should be impossible
            throw new Error("How could you reach this point?")
        }

        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            user: req.user,
        })
    } catch (err) {
        console.error("Error during get me:", err)
        next(err)
    }
}
