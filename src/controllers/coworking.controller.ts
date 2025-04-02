import { Request, Response, NextFunction, CookieOptions } from "express"
import { CoWorkingDTO } from "../dtos/coworking.dto"
import { validateDto } from "../utils/validateDto"
import { constants } from "http2"
import { CoWorkingModel } from "../models/coworking.model"

const coWorkingModel = new CoWorkingModel()

// @desc    Create new coworking
// @route   POST /api/v1/coworkings
// @access  Private
export const createNewCoWorking = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { name, address, phone, open_time, close_time } = req.body

        const coWorkingDto = new CoWorkingDTO()
        coWorkingDto.name = name
        coWorkingDto.address = address
        coWorkingDto.phone = phone
        coWorkingDto.open_time = open_time
        coWorkingDto.close_time = close_time
        

        // Validate CoworkingDto
        const valErrorMessages = await validateDto(coWorkingDto)
        if (valErrorMessages) {
            res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                msg: valErrorMessages,
            })
            return
        }


        // Create a new coworking in database
        const newCoWorking = await coWorkingModel.createCoWorking({
            name,
            address,
            phone,
            open_time,
            close_time
        })
        res.status(constants.HTTP_STATUS_CREATED).json({
            success: true,
            data: newCoWorking
        })
    } catch (err) {
        console.error("Error during coworking creation:", err)
        next(err)
    }
}