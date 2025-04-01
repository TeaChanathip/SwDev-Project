import { validate, ValidationError } from "class-validator"

// Note: I know this look weird, but this is the only way to make it work
export async function validateDto<T extends object>(
    dtoObject: T,
): Promise<string[] | null> {
    // Validate the instance
    const validationErrors: ValidationError[] = await validate(dtoObject)

    // If there are no validation errors, return an empty array
    if (!validationErrors.length) {
        return null
    }

    // Map validation errors to a readable format
    return validationErrors.map((error) => {
        const constraints = error.constraints
            ? Object.values(error.constraints).join(", ")
            : "Invalid value"
        return `${error.property}: ${constraints}`
    })
}
