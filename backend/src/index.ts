// Imports
import express from 'express';
import dotenv from 'dotenv';
import cookiesParser from 'cookie-parser';
import cors from "cors"
import { authRoutes } from './routes/authRoutes.js';
import { initRedis } from './libs/redis.js';
import {ExpressSession} from "./utils/session.js";

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

app.use(ExpressSession);



// Routes
// Auth Routes
app.use("/api/auth", authRoutes);


// Server
async function startServer(){
    try {
        await initRedis();
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);

        });
    }
    catch(err){
        console.error('Failed to start server', err);
    }
}

startServer();