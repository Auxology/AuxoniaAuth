import jwt from "jsonwebtoken";

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

// This extends the SessionData interface from express-session to contain the userId property often used by us.
declare module 'express-session' {
    interface SessionData {
        userId: string;
    }
}