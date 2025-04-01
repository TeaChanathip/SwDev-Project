import { JwtPayload } from "jsonwebtoken"
import { UserRole } from "../models/user.model"

export interface TokenPayload extends JwtPayload {
    id: number
    role: UserRole
} 