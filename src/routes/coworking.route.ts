import express from "express"
import { createNewCoWorking } from "../controllers/coworking.controller"

const router = express.Router()

router.post("/", createNewCoWorking)

export default router