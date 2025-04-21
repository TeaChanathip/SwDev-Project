import {
    ArrayMaxSize,
    ArrayUnique,
    IsArray,
    IsEmail,
    IsOptional,
} from "class-validator"

export class CreateInvitationDTO {
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(20, { message: "Can invite at most 20 users at a time." })
    @IsEmail({}, { each: true })
    @ArrayUnique()
    invitees?: string[]
}
