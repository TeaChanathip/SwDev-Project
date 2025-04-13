import { ClassConstructor, plainToInstance } from "class-transformer"
import { NextFunction, Request, Response } from "express"
import { constants } from "http2"
import { validateDto } from "../utils/validateDto"

export function validateReqBody<T extends object>(
    dtoConstructor: ClassConstructor<T>,
) {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Create a class from object
        const dto = plainToInstance(dtoConstructor, req.body)

        // Map validation errors to a readable format
        const valErrorMessages = await validateDto(dto)

        // Response with validation error messages
        if (valErrorMessages) {
            res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                msg: valErrorMessages,
            })
            return
        }

        // In case of there are transformed fields
        req.body = dto

        next()
    }
}
