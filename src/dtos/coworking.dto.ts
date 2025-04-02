import {
    IsAlphanumeric,
    IsDate,
    IsNotEmpty,
    IsOptional,
    IsPhoneNumber,
    Matches,
    MaxLength,
} from "class-validator"
import { IsTimeAfter } from "../decorators/IsTimeAfter"
import { IsTimeFormat } from "../decorators/IsTimeFormat"

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
