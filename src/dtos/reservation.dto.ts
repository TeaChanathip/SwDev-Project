import {
    IsDateString,
    IsNotEmpty,
    IsNumber,
} from "class-validator"
import { IsDateAfter } from "../decorators/IsDateAfter"

export class CreateReservationDTO {
    @IsNotEmpty()
    @IsNumber({ allowNaN: false })
    owner_id?: number

    @IsNotEmpty()
    @IsNumber({ allowNaN: false })
    room_id?: number

    @IsNotEmpty()
    @IsDateString()
    start_at?: Date

    @IsNotEmpty()
    @IsDateString()
    @IsDateAfter("start_at")
    end_at?: Date
}
