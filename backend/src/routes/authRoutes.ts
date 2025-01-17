import express from "express";
import { signup, verifyEmail } from "../controllers/authControllers.js";
import {temporarySessionProtection} from "../middlewares/authMiddleware.js";

export const authRoutes = express.Router();

authRoutes.post("/signup", signup);
authRoutes.post("/verify-email", verifyEmail);
authRoutes.get("/finish-signup", temporarySessionProtection, (req, res) => {
    res.status(200).json({message: "Success"});
});
