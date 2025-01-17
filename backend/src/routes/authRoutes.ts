import express from "express";
import { signup, verifyEmail } from "../controllers/authControllers.js";
import crypto from "crypto";

export const authRoutes = express.Router();

authRoutes.post("/signup", signup);
authRoutes.post("/verify-email", verifyEmail);