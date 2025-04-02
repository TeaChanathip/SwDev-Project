import { NextFunction, Response } from "express"
import { UserRole } from "../models/user.model"
import { RequestWithUser } from "../interfaces/RequestWithUser.interface"
import { constants } from "http2"

export const authorize = (...roles: UserRole[]) => {
    return (req: RequestWithUser, res: Response, next: NextFunction) => {
        if (!req.user) {
            res.status(constants.HTTP_STATUS_UNAUTHORIZED).json({
                success: false,
                msg: `User is not authenticated`,
            })
            return
        }

        if (!roles.includes(req.user.role)) {
            res.status(constants.HTTP_STATUS_FORBIDDEN).json({
                success: false,
                msg: `User role ${req.user.role} is not authorized to access this route`,
            })
            return
        }

        next()
    }
}
