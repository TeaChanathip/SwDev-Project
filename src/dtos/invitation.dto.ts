import {
    ArrayMaxSize,
    ArrayMinSize,
    ArrayUnique,
    IsArray,
    IsEmail,
    IsNotEmpty,
} from "class-validator"

export class CreateInvitationDTO {
    @IsNotEmpty()
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(20, { message: "Can invite at most 20 users at a time." })
    @IsEmail({}, { each: true })
    @ArrayUnique()
    invitees?: string[]
}
