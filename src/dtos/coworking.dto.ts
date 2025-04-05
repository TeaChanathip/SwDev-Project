import {
    IsAlphanumeric,
    IsDate,
    IsDateString,
    IsNotEmpty,
    IsNumber,
    IsNumberString,
    IsOptional,
    IsPhoneNumber,
    IsString,
    MaxLength,
} from "class-validator"
import { IsTimeAfter } from "../decorators/IsTimeAfter"
import { IsTimeFormat } from "../decorators/IsTimeFormat"
import { Trim } from "../decorators/Trim"
import { IsDateAfter } from "../decorators/IsDateAfter"

export class CreateCoWorkingDTO {
    @IsNotEmpty()
    @IsAlphanumeric()
    @MaxLength(255)
    name?: string

    @IsNotEmpty()
    @MaxLength(255)
    address?: string

    @IsNotEmpty()
    @IsPhoneNumber()
    phone?: string

    @IsNotEmpty()
    @IsTimeFormat()
    open_time?: string

    @IsNotEmpty()
    @IsTimeAfter("open_time")
    close_time?: string
}

export class UpdateCoWorkingDTO {
    @IsOptional()
    @IsAlphanumeric()
    @MaxLength(255)
    name?: string

    @IsOptional()
    @IsPhoneNumber()
    @MaxLength(15)
    phone?: string

    @IsOptional()
    @IsTimeFormat()
    open_time?: string

    @IsOptional()
    @IsTimeFormat()
    @IsTimeAfter("open_time")
    close_time?: string

    @IsNotEmpty()
    @IsDate()
    updated_at?: Date
}

export class GetAllCoWorkingDTO {
    @IsOptional()
    @IsString()
    @Trim()
    name?: string

    @IsOptional()
    @IsString()
    @Trim()
    address?: string

    @IsOptional()
    @IsTimeFormat()
    open_time?: string

    @IsOptional()
    @IsTimeFormat()
    @IsTimeAfter("open_time")
    close_time?: string

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
