// Those are function related to session
import session from "express-session";
import { db } from "../db/index.js";
import { sessions } from "../db/schema.js";
import { eq } from "drizzle-orm";
import pgSession from "connect-pg-simple";
import pg from "pg";

const PostgresStore = pgSession(session);

const pool = new pg.Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
})


// This defines middleware for index.ts
export const ExpressSession = session({
    store: new PostgresStore({
        pool: pool,
        tableName: 'session',   // This is configurable
        createTableIfMissing: false,
    }),
    secret: process.env.JWT_KEY!,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24, // 1 day
    }
});

export const updateSession = async (sid:string, userId:string):Promise<void> => {
    await db.update(sessions)
        .set({ userId })
        .where(eq(sessions.sid, sid));
}

export const deleteSession = async (sid:string):Promise<void> => {
    await db.delete(sessions).where(eq(sessions.sid, sid));
}

