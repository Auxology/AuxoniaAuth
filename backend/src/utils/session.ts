// Those are function related to session
import {prisma} from "../libs/prisma.js";
import session from "express-session";
import {PrismaSessionStore} from "@quixo3/prisma-session-store";

// This defines middleware for index.ts
export const ExpressSession = session({
    secret: process.env.JWT_KEY!, // Replace with a secure key
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
    store: new PrismaSessionStore(prisma, {
        checkPeriod: 2 * 60 * 1000, // Remove expired sessions every 2 mins
        dbRecordIdIsSessionId: true, // Use session ID as record ID
        dbRecordIdFunction: undefined,
    }),
})

export const updateSession = async (id:string, userId:string):Promise<void> => {
    await prisma.session.update({
        where: { id },
        data: { userId },
    });
}