import { Request, Response, NextFunction, CookieOptions } from "express"
import { RegisterDTO } from "../dtos/auth.dto"
import { constants } from "http2"
import { validateDto } from "../utils/validateDto"
import { User, UserModel, UserRole } from "../models/user.model"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { StringValue } from "ms"

const userModel = new UserModel()

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { name, phone, email, password } = req.body

        const registerDto: RegisterDTO = {
            name,
            phone,
            email,
            password,
        }

        // Validate registerDto
        const valErrorMessages = await validateDto(RegisterDTO, registerDto)
        if (valErrorMessages) {
            res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                msg: valErrorMessages,
            })
            return
        }

        // Check if email already exists
        const user = await userModel.getUserByEmail(email)
        if (user) {
            res.status(constants.HTTP_STATUS_CONFLICT).json({
                success: false,
                msg: "Email already exists",
            })
            return
        }

        // Hashed the password
        const hashedPassword = await hashPassword(password)

        // Create a new user in database
        const newUser = await userModel.createUser({
            name,
            phone,
            email,
            password: hashedPassword,
            role: UserRole.USER,
        })

        await sendTokenResponse(newUser, constants.HTTP_STATUS_CREATED, res)
    } catch (err) {
        console.error("Error during registration:", err)
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
            success: false,
            msg: "An unexpected error occured",
        })
    }
}

const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    return hashedPassword
}

const sendTokenResponse = async (
    user: User,
    statusCode: number,
    res: Response,
) => {
    const { JWT_SECRET, JWT_EXPIRE, JWT_COOKIE_EXPIRE } = process.env

    if (!JWT_SECRET || !JWT_EXPIRE || !JWT_COOKIE_EXPIRE) {
        throw Error("JWT environment variables are not defined")
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET as jwt.Secret, {
        expiresIn: JWT_EXPIRE as StringValue,
    })

    const cookieOptions: CookieOptions = {
        expires: new Date(
            Date.now() + parseInt(JWT_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000,
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    }

    const { password: _, ...userWithoutPassword } = user

    res.status(statusCode).cookie("token", token, cookieOptions).json({
        success: true,
        user: userWithoutPassword,
        token,
    })
}
