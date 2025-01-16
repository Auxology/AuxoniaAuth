import express from "express";
import { signup } from "../controllers/authControllers.js";

export const authRoutes = express.Router();

authRoutes.post("/signup", signup);

