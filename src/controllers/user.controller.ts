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
        if (Number.isNaN(userId)) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: "User with the provided ID does not exist.",
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

        // Garantee that the userId exists
        const updatedUser = await userModel.updateUserById(me.id, updateUserDTO)
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

// @desc    Delete One User (themself)
// @route   DELETE /api/v1/users/me
// @access  Private
export const deleteMe = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
) => {
    try {
        const me = req.user!

        const deletedMe = await userModel.deleteUserById(me.id)
        if (!deletedMe) {
            // Should be impossible to reach this point
            throw new Error("Something went wrong.")
        }

        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            data: {},
        })
    } catch (err) {
        console.error("Error during delete me:", err)
        next(err)
    }
}

// @desc    Delete One User
// @route   DELETE /api/v1/users/:id
// @access  Private
export const deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = parseInt(req.params.id)
        if (Number.isNaN(userId)) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: "User with the provided ID does not exist.",
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

        if (user.role === UserRole.ADMIN) {
            res.status(constants.HTTP_STATUS_FORBIDDEN).json({
                success: false,
                msg: "Admin cannot be deleted."
            })
            return
        } 

        const deletedUser = await userModel.deleteUserById(userId)
        if (!deletedUser) {
            // Should be impossible to reach this point
            throw new Error("Something went wrong.")
        }

        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            data: {},
        })
    } catch (err) {
        console.error("Error during delete user:", err)
        next(err)
    }
}
