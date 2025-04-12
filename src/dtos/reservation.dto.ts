import {
    IsDate,
    IsDateString,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsNumberString,
    IsOptional,
} from "class-validator"
import { IsDateAfter } from "../decorators/IsDateAfter"
import { IsFutureDate } from "../decorators/IsFutureDate"

export class CreateReservationDTO {
    @IsNotEmpty()
    @IsDateString()
    @IsFutureDate()
    start_at: Date = new Date()

    @IsNotEmpty()
    @IsDateString()
    @IsDateAfter("start_at")
    end_at: Date = new Date()
}

export class GetAllReservationDTO {
    @IsOptional()
    @IsNumber({ allowNaN: false })
    user_id?: number

    @IsOptional()
    @IsDateString()
    start_before?: Date

    @IsOptional()
    @IsDateString()
    start_after?: Date

    @IsOptional()
    @IsDateString()
    @IsDateAfter("begin_after")
    @IsDateAfter("begin_before")
    end_before?: Date

    @IsOptional()
    @IsDateString()
    @IsDateAfter("begin_after")
    @IsDateAfter("begin_before")
    end_after?: Date

    @IsOptional()
    @IsDateString()
    created_after?: Date

    @IsOptional()
    @IsDateString()
    @IsDateAfter("created_after")
    created_before?: Date

    @IsOptional()
    @IsDateString()
    updated_after?: Date

    @IsOptional()
    @IsDateString()
    @IsDateAfter("updated_after")
    updated_before?: Date

    @IsOptional()
    @IsNumberString()
    limit?: number

    @IsOptional()
    @IsNumberString()
    page?: number
}
