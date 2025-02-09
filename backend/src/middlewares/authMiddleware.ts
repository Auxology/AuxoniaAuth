import type{ Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import {
    verifyChangeEmailSession,
    verifyForgotPasswordSession,
    verifyTemporarySession
} from "../libs/redis.js";
import type { JwtPayloadWithEmail } from '../types/types.js';

// This middleware which will protect the routes that might be accessed by temporary session, signup and login,
// In frontend if user has temporary session, we will redirect him to the page where he can finish creating the account
export const temporarySessionProtection = async (req: Request, res: Response, next: Function):Promise<void> => {
    try {
        const token = req.cookies['temp-session'];

        if(!token) {
            res.status(401).json({message: "Unauthorized - No Token Provided"});
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_KEY!) as JwtPayloadWithEmail;

        if(!decoded) {
            res.status(401).json({message: "Unauthorized - Invalid Token"});
            return;
        }

        // Now we check if the token exists in the database
        const verifyTempSession = await verifyTemporarySession(decoded.email);

        if(!verifyTempSession) {
            res.status(401).json({message: "Unauthorized - Token Expired"});
            return;
        }

        req.email = decoded.email;
        next();
    }
    catch(err) {
        res.status(500).json({message: "Internal Server Error"});
    }
}

// This middleware will protect the routes that require user to be logged in
export const isAuthenticated =(req: Request, res: Response, next: Function):void  => {
    // You should also ideally clear the cookie on the frontend
    if(!req.session.userId) {
        res.clearCookie('connect.sid');
        res.status(401).json({message: "Unauthorized - Not Logged In"});
        return;
    }

    next();
}

// This middleware will protect the routes that are related to forget password
export const forgetPasswordProtection = async (req: Request, res: Response, next: Function):Promise<void> => {
    try {
        const token = req.cookies['forgot-password'];

        if(!token) {
            res.status(401).json({message: "Unauthorized - No Token Provided"});
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_KEY!) as JwtPayloadWithEmail;

        if(!decoded) {
            res.status(401).json({message: "Unauthorized - Invalid Token"});
            return;
        }

        // Now we check if the token exists in the database
        const verifyForgetPassword = await verifyForgotPasswordSession(decoded.email);

        if(!verifyForgetPassword) {
            res.status(401).json({message: "Unauthorized - Token Expired"});
            return;
        }

        // This will be used to get the email in the controller
        req.forgot_password_email = decoded.email;
        next();
    }
    catch(err) {
        res.status(500).json({message: "Internal Server Error"});
    }
};

export const changeEmailProtection = async (req: Request, res: Response, next: Function):Promise<void> => {
    try{
        const token = req.cookies['email-change'];

        if(!token) {
            res.status(401).json({message: "Unauthorized - No Token Provided"});
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_KEY!) as JwtPayloadWithEmail;

        if(!decoded) {
            res.status(401).json({message: "Unauthorized - Invalid Token"});
            return;
        }

        // Now we check if the token exists in the database
        const verify = await verifyChangeEmailSession(decoded.userId);

        if(!verify) {
            res.status(401).json({message: "Unauthorized - Token Expired"});
            return;
        }

        next();
    }
    catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error"});
    }
}