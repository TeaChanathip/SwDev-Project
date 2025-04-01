import {
    IsAlphanumeric,
    IsEmail,
    IsNotEmpty,
    IsPhoneNumber,
    IsStrongPassword,
    Length,
} from "class-validator"

export class RegisterDTO {
    @IsNotEmpty()
    @IsAlphanumeric()
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

export class LoginDTO {
    @IsNotEmpty()
    @IsEmail()
    email?: string

    @IsNotEmpty()
    @Length(6, 64)
    password?: string
}
