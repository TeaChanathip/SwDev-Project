import { ValidationOptions, registerDecorator, ValidationArguments } from "class-validator";
import { isValidTimeFormat } from "../utils/isValidTimeFormat";

export function IsTimeAfter(property: string, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
      registerDecorator({
        name: "IsTimeAfter",
        target: object.constructor,
        propertyName: propertyName,
        constraints: [property],
        options: validationOptions,
        validator: {
          validate(value: any, args: ValidationArguments) {
            const relatedPropertyName = args.constraints[0];
            const relatedValue = (args.object as any)[relatedPropertyName];
  
            // Ensure both values exist and are in the correct format
            if (!value || !relatedValue) return false;
            if (!isValidTimeFormat(value) || !isValidTimeFormat(relatedValue)) {
              return false; // Ensure both are in HH:MM:SS format
            }
  
            // Compare the times lexicographically
            return value > relatedValue;
          },
          defaultMessage(args: ValidationArguments) {
            return `${args.property} must be a valid time (HH:MM:SS) and later than ${args.constraints[0]}`;
          },
        },
      });
    };
  }