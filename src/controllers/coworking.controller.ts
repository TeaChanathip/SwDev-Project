import { Request, Response, NextFunction } from "express"
import {
    CreateCoWorkingDTO,
    GetAllCoWorkingDTO,
    UpdateCoWorkingDTO,
} from "../dtos/coworking.dto"
import { constants } from "http2"
import { CoWorkingModel } from "../models/coworking.model"
import { plainToInstance } from "class-transformer"

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
        const coWorkingDto = plainToInstance(CreateCoWorkingDTO, req.body)

        // Create a new coworking in database
        const newCoWorking = await coWorkingModel.createCoWorking(coWorkingDto)
        res.status(constants.HTTP_STATUS_CREATED).json({
            success: true,
            data: newCoWorking,
        })
    } catch (err) {
        console.error("Error during coworking creation:", err)
        next(err)
    }
}

// @desc    Update coworking
// @route   PUT /api/v1/coworkings/:id
// @access  Private
export const updateCoWorking = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const coWorkingId = parseInt(req.params.id)
        // CoWorkingId might be NaN
        if (Number.isNaN(coWorkingId)) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: "There is no coworking that matchs with the provided ID",
            })
            return
        }

        const { open_time, close_time } = req.body

        // close_time and open_time must be presented if any present
        if ((open_time && !close_time) || (!open_time && close_time)) {
            res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                msg: "Open time and close time must both be present if any is present.",
            })
            return
        }
        // check if coworking exist
        const coworkingExists = await coWorkingModel.getCoWorkingByID(coWorkingId)
        if (!coworkingExists) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: `Coworking with id ${coWorkingId} does not exist.`,
            })
            return
        }

        const updateCoWorkingDto = plainToInstance(UpdateCoWorkingDTO, req.body)
        updateCoWorkingDto.updated_at = new Date() // This one doesn't need to be validated

        // Update an existing coworking in database
        const updatedCoWorking = await coWorkingModel.updateCoWorkingByID(
            coWorkingId,
            updateCoWorkingDto,
        )
        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            data: updatedCoWorking,
        })
    } catch (err) {
        console.error("Error during coworking update:", err)
        next(err)
    }
}

// @desc    Delete coworking
// @route   DELETE /api/v1/coworkings/:id
// @access  Private
export const deleteCoWorking = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const coWorkingId = parseInt(req.params.id)
        // CoWorkingId might be NaN
        if (Number.isNaN(coWorkingId)) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: "There is no coworking that matchs with the provided ID",
            })
            return
        }
        // check if coworking exist
        const coworkingExists = await coWorkingModel.getCoWorkingByID(coWorkingId)
        if (!coworkingExists) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: `Coworking with id ${coWorkingId} does not exist.`,
            })
            return
        }

        const deleteCoWorking =
            await coWorkingModel.deleteCoWorkingByID(coWorkingId)
        if (!deleteCoWorking) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: "Coworking you are trying to delete does not exist",
            })
            return
        }
        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            data: {},
        })
    } catch (err) {
        console.error("Error during coworking deletion:", err)
        next(err)
    }
}

// @desc    Get all coworkings
// @route   GET /api/v1/coworkings
// @access  Public
export const getAllCoWorkings = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const getAllCoWorkingDTO = plainToInstance(
            GetAllCoWorkingDTO,
            req.query,
        )

        const coWorkings =
            await coWorkingModel.getAllCoWorkings(getAllCoWorkingDTO)

        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            data: coWorkings,
        })
    } catch (err) {
        console.error("Error during get all coworkings:", err)
        next(err)
    }
}

// @desc    Get one coworking
// @route   GET /api/v1/coworkings/:id
// @access  Public
export const getOneCoworking = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const coWorkingId = parseInt(req.params.id)
        // CoWorkingId might be NaN
        if (Number.isNaN(coWorkingId)) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: "There is no coworking that matchs with the provided ID",
            })
            return
        }

        const coWorking = await coWorkingModel.getCoWorkingByID(coWorkingId)
        if (!coWorking) {
            res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                msg: `Coworking with id ${coWorkingId} does not exist.`,
            })
            return
        }

        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            data: coWorking,
        })
    } catch (err) {
        console.error("Error during get one coworking:", err)
        next(err)
    }
}
