import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
} from "class-validator"

export function NotUserInput(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "NotUserInput",
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return value === undefined // Ensure the field is undefined
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} should not be provided by the user.`
                },
            },
        })
    }
}
