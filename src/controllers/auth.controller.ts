import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.model";

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = (req: Request, res: Response, next: NextFunction) => {}