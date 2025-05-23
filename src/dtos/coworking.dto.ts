import {
    IsDateString,
    IsNotEmpty,
    IsOptional,
    IsPhoneNumber,
    IsString,
    MaxLength,
} from "class-validator"
import { IsTimeAfter } from "../decorators/IsTimeAfter"
import { IsTimeFormat } from "../decorators/IsTimeFormat"
import { Trim } from "../decorators/Trim"
import { IsDateAfter } from "../decorators/IsDateAfter"
import { PaginationDTO } from "./pagination.dto"
import { RequireAtLeastOne } from "../decorators/RequireAtLeastOne"
import { NotUserInput } from "../decorators/NotUserInput"

export class CreateCoWorkingDTO {
    @IsString()
    @Trim()
    @IsNotEmpty()
    @MaxLength(255)
    name?: string

    @IsString()
    @Trim()
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

@RequireAtLeastOne()
export class UpdateCoWorkingDTO {
    @IsOptional()
    @IsString()
    @Trim()
    @IsNotEmpty()
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

    @NotUserInput()
    updated_at?: Date
}

export class GetAllCoWorkingDTO extends PaginationDTO {
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
}
