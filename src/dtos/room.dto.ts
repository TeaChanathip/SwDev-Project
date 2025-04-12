import {
    IsDateString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from "class-validator"
import { Trim } from "../decorators/Trim"
import { IsDateAfter } from "../decorators/IsDateAfter"
import { Type } from "class-transformer"
import { PaginationDTO } from "./pagination.dto"

export class CreateRoomDTO {
    @IsString()
    @Trim()
    @IsNotEmpty()
    @MaxLength(255)
    name?: string

    @IsNotEmpty()
    @IsNumber({ allowNaN: false })
    @Min(1)
    capacity?: number

    @IsNotEmpty()
    @IsNumber({ allowNaN: false })
    @Min(0)
    price?: number
}

export class UpdateRoomDTO {
    @IsOptional()
    @IsString()
    @Trim()
    @IsNotEmpty()
    @MaxLength(255)
    name?: string

    @IsOptional()
    @IsNumber({ allowNaN: false })
    @Min(1)
    capacity?: number

    @IsOptional()
    @IsNumber({ allowNaN: false })
    @Min(0)
    price?: number

    // Not an user's input
    updated_at?: Date
}

export class GetAllRoomDTO extends PaginationDTO {
    @IsOptional()
    @IsString()
    @Trim()
    name?: string

    //lower boundary (can contain at least n)
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    capacity?: number

    //upper boundary (at most m)
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(0)
    price?: number

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
