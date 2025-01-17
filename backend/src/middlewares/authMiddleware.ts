import type{ Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import {verifyTemporarySession} from "../libs/redis.js";

// This middleware which will protect the routes that might be accessed by temporary session, signup and login,
// In frontend if user has temporary session, we will redirect him to the page where he can finish creating the account
export const temporarySessionProtection = async (req: Request, res: Response, next: Function):Promise<any> => {
    try {
        const token = req.cookies['temp-session'];

        if(!token) {
            return res.status(401).json({message: "Unauthorized - No Token Provided"});
        }

        const decoded = jwt.verify(token, process.env.JWT_KEY!);

        if(!decoded) {
            return res.status(401).json({message: "Unauthorized - Invalid Token"});
        }

        // Now we check if the token exists in the database
        // TODO: Fix type error here
        const verifyTempSession = await verifyTemporarySession(decoded.email);

        if(!verifyTempSession) {
            return res.status(401).json({message: "Unauthorized - Token Expired"});
        }

        // TODO: Fix type error here
        req.email = decoded.email;
        next();
    }
    catch(err) {
        return res.status(500).json({message: "Internal Server Error"});
    }
}