import { validate, ValidationError } from "class-validator";

export async function validateDto<T extends object>(dto: T): Promise<string[]> {
    const validationErrors: ValidationError[] = await validate(dto);

    if (!validationErrors.length) {
        return [];
    }

    // Map errors to a detailed message format
    return validationErrors.map((error) => {
        const constraints = error.constraints
            ? Object.values(error.constraints).join(", ")
            : "Invalid value";
        return `${error.property}: ${constraints}`;
    });
}