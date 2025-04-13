import { validate, ValidationError } from "class-validator"

export async function validateDto<T extends object>(
    dtoObject: T,
): Promise<string[] | null> {
    // Validate the instance
    const validationErrors: ValidationError[] = await validate(dtoObject, {
        whitelist: true,
        forbidNonWhitelisted: true,
    })

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
