import jwt from "jsonwebtoken";
import type{ Request } from "express";

export interface JwtPayloadWithEmail extends jwt.JwtPayload {
    email: string;
}

//Global declaration of the email property in the Request interface
declare global {
    namespace Express {
        interface Request {
            email: string;
        }
    }
}