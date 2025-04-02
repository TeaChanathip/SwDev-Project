import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
} from "class-validator"
import { isValidTimeFormat } from "../utils/isValidTimeFormat"

export function IsTimeFormat(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "IsTimeFormat",
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    // Ensure the value matches the HH:MM:SS format
                    return isValidTimeFormat(value)
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be in the format HH:MM:SS`
                },
            },
        })
    }
}
