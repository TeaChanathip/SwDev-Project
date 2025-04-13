import {
    IsDateString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from "class-validator"
import { IsDateAfter } from "../decorators/IsDateAfter"
import { IsFutureDate } from "../decorators/IsFutureDate"
import { PaginationDTO } from "./pagination.dto"
import { Type } from "class-transformer"
import { NotUserInput } from "../decorators/NotUserInput"
import { RequireAtLeastOne } from "../decorators/RequireAtLeastOne"
import { Trim } from "../decorators/Trim"

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

export class GetAllReservationDTO extends PaginationDTO {
    // Only for Admin
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
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
}

export class UpdateReservationDTO {
    @IsNotEmpty()
    @IsDateString()
    @IsFutureDate()
    start_at: Date = new Date()

    @IsNotEmpty()
    @IsDateString()
    @IsDateAfter("start_at")
    end_at: Date = new Date()

    @NotUserInput()
    updated_at?: Date
}
