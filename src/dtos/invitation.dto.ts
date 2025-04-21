import {
    ArrayMaxSize,
    ArrayMinSize,
    ArrayUnique,
    IsArray,
    IsBoolean,
    IsBooleanString,
    IsDateString,
    IsEmail,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    Min,
} from "class-validator"
import { IsDateAfter } from "../decorators/IsDateAfter"
import { PaginationDTO } from "./pagination.dto"
import { InvitationStatus } from "../models/invitation.model"
import { NotUserInput } from "../decorators/NotUserInput"
import { Transform, Type } from "class-transformer"

export class CreateInvitationsDTO {
    @IsNotEmpty()
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(20, { message: "Can invite at most 20 users at a time." })
    @IsEmail({}, { each: true })
    @ArrayUnique()
    invitees?: string[]
}

export class GetAllInvitationsDTO extends PaginationDTO {
    // Only for Admin
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(1)
    inviter_id?: number

    @IsOptional()
    @IsEnum(InvitationStatus)
    status?: InvitationStatus

    @IsOptional()
    @IsDateString()
    created_after?: Date

    @IsOptional()
    @IsDateString()
    @IsDateAfter("created_after")
    created_before?: Date

    @IsOptional()
    @Transform(({ value }) => {
        if (value === "true") return true;
        if (value === "false") return false;
        return value;
    })
    @IsBoolean()
    is_future_event?: boolean

    @NotUserInput()
    reservation_id?: number

    @NotUserInput()
    invitee_id?: number
}
