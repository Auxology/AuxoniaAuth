import express from "express";
import {finishSignup, signup, verifyEmail} from "../controllers/authControllers.js";
import {temporarySessionProtection} from "../middlewares/authMiddleware.js";

export const authRoutes = express.Router();

authRoutes.post("/signup", signup);
authRoutes.post("/verify-email", verifyEmail);
authRoutes.post("/finish-signup", temporarySessionProtection, finishSignup)