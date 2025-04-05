import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
} from "class-validator"

// This decorator is intended to use with IsDateString
export function IsDateAfter(
    property: string,
    validationOptions?: ValidationOptions,
) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "IsDateAfter",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    // Get the value of compared Date
                    const relatedPropertyName = args.constraints[0]
                    const relatedValue = (args.object as any)[
                        relatedPropertyName
                    ]

                    // Ensure that the value actually exists
                    if (!value) return false

                    if (!relatedValue) return true

                    // Convert both values to Date objects for comparison
                    const currentDate = new Date(value)
                    const relatedDate = new Date(relatedValue)

                    // Ensure both values are valid dates
                    if (
                        isNaN(currentDate.getTime()) ||
                        isNaN(relatedDate.getTime())
                    ) {
                        return false
                    }

                    return currentDate > relatedDate
                },
                defaultMessage(args: ValidationArguments) {
                    const relatedPropertyName = args.constraints[0]
                    return `${args.property} must be later than ${relatedPropertyName}`
                },
            },
        })
    }
}
