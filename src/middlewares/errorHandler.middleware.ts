import { NextFunction, Request, Response } from "express"
import { constants } from "http2"

interface ErrorResponse {
    success: boolean
    msg: string
    stack?: string
}

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const isDevelopment = process.env.NODE_ENV === "development"

    // Include error message in development mode
    const errMessage = isDevelopment
        ? err.message
        : "An unexpected error occurred"

    const response: ErrorResponse = {
        success: false,
        msg: errMessage,
    }

    // Include stack trace in development mode
    if (isDevelopment) {
        response.stack = err.stack
    }

    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json(response)
}
