import {
    IsAlphanumeric,
    IsDate,
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
    @IsTimeAfter("open_time")
    close_time?: string

    @IsOptional()
    @IsDate()
    created_after?: Date

    @IsOptional()
    @IsDateAfter("created_after")
    created_before?: Date

    @IsOptional()
    @IsDate()
    updated_after?: Date

    @IsOptional()
    @IsDateAfter("updated_after")
    updated_before?: Date

    @IsOptional()
    @IsNumber()
    limit?: number

    @IsOptional()
    @IsNumber()
    page?: number
}