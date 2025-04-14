import { NextFunction, Request, response, Response } from "express"
import { UserModel, UserRole } from "../models/user.model"
import { RequestWithUser } from "../interfaces/RequestWithUser.interface"
import { constants } from "http2"
import { plainToInstance } from "class-transformer"
import { GetAllUsersDTO, UpdateUserDTO } from "../dtos/user.dto"

const userModel = new UserModel()

// @desc    Get One User (themself)
// @route   GET /api/v1/users/me
// @access  Private
export const getMe = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
) => {
    try {
        const me = req.user!

        const { password: _, ...userWithoutPassword } = me

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

// @desc    Update One User (themself)
// @route   PUT /api/v1/users/me
// @access  Private
export const updateMe = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
) => {
    try {
        const me = req.user!

        const updateUserDTO = plainToInstance(UpdateUserDTO, req.body)

        const updatedUser = await userModel.updateUser(me.id, updateUserDTO)
        updatedUser.updated_at = new Date()
        
        const { password: _, ...updatedUserWithoutPassword } = updatedUser

        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            data: updatedUserWithoutPassword,
        })
    } catch (err) {
        console.error("Error during update me:", err)
        next(err)
    }
}
