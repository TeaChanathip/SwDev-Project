import {
    ValidationOptions,
    registerDecorator,
    ValidationArguments,
} from "class-validator"

// This decorator is intended to use with IsTimeFormat
export function IsTimeAfter(
    property: string,
    validationOptions?: ValidationOptions,
) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "IsTimeAfter",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const relatedPropertyName = args.constraints[0]
                    const relatedValue = (args.object as any)[
                        relatedPropertyName
                    ]

                    // Ensure that the value actually exists
                    if (!value) return false

                    // If the compared value is unavailable
                    if (!relatedValue) return true

                    // Compare the times lexicographically
                    return value > relatedValue
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be later than ${args.constraints[0]}`
                },
            },
        })
    }
}
