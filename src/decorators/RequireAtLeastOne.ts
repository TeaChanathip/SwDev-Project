import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
} from "class-validator"

export function RequireAtLeastOne(validationOptions?: ValidationOptions) {
    return function (constructor: Function) {
        registerDecorator({
            name: "RequireAtLeastOne",
            target: constructor,
            propertyName: "All",
            options: validationOptions,
            validator: {
                validate(_: any, args: ValidationArguments) {
                    const obj = args.object
                    return Object.values(obj).some(
                        (value) => value !== undefined,
                    )
                },
                defaultMessage(): string {
                    return "At least one field must be defined."
                },
            },
        })
    }
}
