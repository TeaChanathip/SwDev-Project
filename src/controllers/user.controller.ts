import { NextFunction, Request, response, Response } from "express"
import { UserModel } from "../models/user.model"
import { RequestWithUser } from "../interfaces/RequestWithUser.interface"
import { constants } from "http2"
import { plainToInstance } from "class-transformer"
import { GetAllUsersDTO } from "../dtos/user.dto"

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

        const { password: _, ...userWithoutPassword } = req.user

        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            user: userWithoutPassword,
        })
    } catch (err) {
        console.error("Error during get me:", err)
        next(err)
    }
}

// @desc    Get One User
// @route   GET /api/v1/users/:id
// @access  Private
export const getOneUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = parseInt(req.params.id)

        if (!userId) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: "User ID must be a number.",
            })
            return
        }

        const user = await userModel.getUserById(userId)
        if (!user) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: `User with id ${userId} does not exist.`,
            })
            return
        }

        const { password: _, ...userWithoutPassword } = user

        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            data: userWithoutPassword,
        })
    } catch (err) {
        console.error("Error during get one user:", err)
        next(err)
    }
}

// @desc    Get All User
// @route   GET /api/v1/users
// @access  Private
export const getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const getAllUsersDTO = plainToInstance(GetAllUsersDTO, req.query)

        const users = await userModel.getAllUser(getAllUsersDTO)

        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            data: users,
        })
    } catch (err) {
        console.error("Error during get all users:", err)
        next(err)
    }
}
