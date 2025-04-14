import { IsDateString, IsEnum, IsOptional, IsPhoneNumber, IsString } from "class-validator"
import { UserRole } from "../models/user.model"
import { PaginationDTO } from "./pagination.dto"
import { RequireAtLeastOne } from "../decorators/RequireAtLeastOne"
import { IsDateAfter } from "../decorators/IsDateAfter"

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
