import {
    IsAlphanumeric,
    IsDate,
    IsDateString,
    IsNotEmpty,
    IsNumber,
    IsNumberString,
    IsOptional,
    IsString,
    MaxLength,
} from "class-validator"
import { Trim } from "../decorators/Trim"
import { IsDateAfter } from "../decorators/IsDateAfter"

export class CreateRoomDTO {
    @IsNotEmpty()
    @IsAlphanumeric()
    @MaxLength(255)
    name?: string

    @IsNotEmpty()
    @IsNumber({allowNaN: false})
    capacity?: number

    @IsNotEmpty()
    @IsNumber({allowNaN: false})
    price?: number
}

export class UpdateRoomDTO {
    @IsNotEmpty()
    @IsAlphanumeric()
    @MaxLength(255)
    name?: string

    @IsNotEmpty()
    @IsNumber({allowNaN: false})
    capacity?: number

    @IsNotEmpty()
    @IsNumber({allowNaN: false})
    price?: number

    @IsNotEmpty()
    @IsDate()
    updated_at?: Date
}

export class GetAllRoomDTO {
    @IsOptional()
    @IsString()
    @Trim()
    name?: string

    //lower boundary (can contain at least n)
    @IsOptional()
    @IsNumber({allowNaN: false})
    capacity?: string

    //upper boundary (at most m)
    @IsOptional()
    @IsNumber({allowNaN: false})
    price?: string

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
