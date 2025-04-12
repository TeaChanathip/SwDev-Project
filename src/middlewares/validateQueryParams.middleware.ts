import { ClassConstructor, plainToInstance } from "class-transformer"
import { NextFunction, Request, Response } from "express"
import { constants } from "http2"
import { validateDto } from "../utils/validateDto"

export function validateQueryParams<T extends object>(
    dtoConstructor: ClassConstructor<T>,
) {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Create a class from object
        const dto = plainToInstance(dtoConstructor, req.query)

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

        // In case of there're tranformed fields
        // Update the properties of req.query
        Object.entries(dto).forEach(([key, value]) => {
            req.query[key] = value
        })

        next()
    }
}
