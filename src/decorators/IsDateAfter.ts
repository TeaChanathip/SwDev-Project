import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
    isDate,
} from "class-validator"

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
                    // Get the compared Date
                    const relatedPropertyName = args.constraints[0]
                    const relatedValue = (args.object as any)[
                        relatedPropertyName
                    ]

                    // Ensure that the value actually exists
                    if (!value) return false

                    // If the compared Date is unavailable
                    if (!relatedValue) return isDate(value)

                    if (!isDate(value) || !isDate(relatedValue)) {
                        return false
                    }

                    return value > relatedValue
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be later than ${args.constraints[0]}` 
                }
            },
        })
    }
}
