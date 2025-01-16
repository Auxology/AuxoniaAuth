// Imports
import express from 'express';
import dotenv from 'dotenv';
import cookiesParser from 'cookie-parser';
import cors from "cors"
import { authRoutes } from './routes/authRoutes.js';

dotenv.config();

const PORT = process.env.PORT!;
const app = express();

// Middlewares
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookiesParser());
app.use(cors({
    credentials: true,
    origin: "http://localhost:5173"
}));

// Routes
// Auth Routes
app.use("/api/auth", authRoutes);

// Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});