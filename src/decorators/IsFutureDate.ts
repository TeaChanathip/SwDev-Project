import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
} from "class-validator"

// This decorator is intended to use with IsDateString
export function IsFutureDate(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "IsFutureDate",
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (!value) return false

                    const inputDate = new Date(value)
                    if (!inputDate) return false

                    const now = new Date()

                    return inputDate > now
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be future date`
                },
            },
        })
    }
}
