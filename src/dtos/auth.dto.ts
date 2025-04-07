import {
    IsEmail,
    IsNotEmpty,
    IsPhoneNumber,
    IsStrongPassword,
    Length,
    Matches,
} from "class-validator"
import { Trim } from "../decorators/Trim"
import { UserRole } from "../models/user.model"

export class RegisterDTO {
    @Matches(/^[A-Za-z0-9\s]+$/, {
        message: "Name can only contain letters, numbers, and spaces",
    })
    @Trim()
    @IsNotEmpty()
    name?: string

    @IsNotEmpty()
    @IsPhoneNumber()
    phone?: string

    @IsNotEmpty()
    @IsEmail()
    email?: string

    @IsNotEmpty()
    @Length(6, 64)
    // @IsStrongPassword()
    password?: string
}

// Role is not from user input, so there's no need to validate
export class RegisterWithRoleDTO extends RegisterDTO {
    role?: UserRole
}

export class LoginDTO {
    @IsNotEmpty()
    @IsEmail()
    email?: string

    @IsNotEmpty()
    @Length(6, 64)
    password?: string
}
