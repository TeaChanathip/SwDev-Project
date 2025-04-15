import {
    IsDateString,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsPhoneNumber,
    IsString,
    Matches,
} from "class-validator"
import { UserRole } from "../models/user.model"
import { PaginationDTO } from "./pagination.dto"
import { RequireAtLeastOne } from "../decorators/RequireAtLeastOne"
import { IsDateAfter } from "../decorators/IsDateAfter"
import { NotUserInput } from "../decorators/NotUserInput"
import { Trim } from "../decorators/Trim"

export class GetAllUsersDTO extends PaginationDTO {
    @IsOptional()
    @IsString()
    name?: string

    @IsOptional()
    @IsPhoneNumber()
    phone?: string // Exact Match

    @IsOptional()
    @IsString()
    email?: string

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole

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

@RequireAtLeastOne()
export class UpdateUserDTO {
    @IsOptional()
    @Matches(/^[A-Za-z0-9\s]+$/, {
        message: "Name can only contain letters, numbers, and spaces",
    })
    @Trim()
    @IsNotEmpty()
    @IsString()
    name?: string

    @IsOptional()
    @IsPhoneNumber()
    phone?: string

    @IsOptional()
    @IsEmail()
    email?: string

    @NotUserInput()
    updated_at?: Date
}
