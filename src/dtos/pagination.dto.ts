import { Type } from "class-transformer"
import { IsInt, IsOptional, Max, Min } from "class-validator"

export class PaginationDTO {
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(1)
    @Max(50)
    limit?: number

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(0)
    page?: number
}
