import {
    IsAlphanumeric,
    IsDate,
    IsNotEmpty,
    IsPhoneNumber,
    Matches,
    MaxLength
} from "class-validator"
import { IsTimeAfter } from "../decorators/IsTimeAfter"
import { IsTimeFormat } from "../decorators/IsTimeFormat"

export class CoWorkingDTO {
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

export class updateCoWorkingDTO {
    @IsNotEmpty()
    @IsAlphanumeric()
    @MaxLength(255)
    name?: string

    @IsNotEmpty()
    @MaxLength(255)
    address?: string

    @IsNotEmpty()
    @IsPhoneNumber()
    @MaxLength(15)
    phone?: string

    @IsNotEmpty()
    @IsTimeFormat()
    open_time?: string

    @IsNotEmpty()
    @IsTimeAfter("open_time")
    close_time?: string

    @IsDate()
    updated_at?: Date
}
