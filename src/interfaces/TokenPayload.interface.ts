import { JwtPayload } from "jsonwebtoken"

export interface TokenPayload extends JwtPayload {
    id: number
}
